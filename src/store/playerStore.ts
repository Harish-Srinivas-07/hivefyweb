import { create } from 'zustand';
import { SongDetail } from '@/types';
import { audioService } from '@/services/AudioService';

export type RepeatMode = 'NONE' | 'ALL' | 'ONE';

interface PlayerState {
  currentSong: SongDetail | null;
  queue: SongDetail[];
  originalQueue: SongDetail[];
  currentIndex: number;
  
  isPlaying: boolean;
  isShuffling: boolean;
  repeatMode: RepeatMode;
  
  currentTime: number;
  duration: number;
  volume: number;
  seekTo: number | null; 

  showQueue: boolean;
  setShowQueue: (show: boolean) => void;

  recentlyPlayed: string[]; 

  playSong: (song: SongDetail, queue: SongDetail[]) => void;
  togglePlayPause: () => void;
  setPlaying: (playing: boolean) => void;
  
  nextSong: () => void;
  prevSong: () => void;
  
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  setProgress: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void; 
  resetSeek: () => void;
  
  addToQueue: (song: SongDetail) => void;
  addSongsToQueue: (songs: SongDetail[]) => void;
  
  _applyShuffle: (current: SongDetail) => void;
  _registerPlay: (songId: string) => void;
}

const HISTORY_LIMIT = 10;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  
  isPlaying: false,
  isShuffling: false,
  repeatMode: 'NONE',
  
  currentTime: 0,
  duration: 0,
  volume: 1.0,
  seekTo: null,
  
  showQueue: false,
  setShowQueue: (show) => set({ showQueue: show }),

  recentlyPlayed: [],

  playSong: (song, queueContext) => {
    let idx = queueContext.findIndex(s => s.id === song.id);
    if (idx === -1) {
       queueContext = [song, ...queueContext];
       idx = 0;
    }

    set({
      originalQueue: [...queueContext],
      queue: [...queueContext],
      currentIndex: idx,
      currentSong: song,
      isPlaying: true
    });

    audioService.play(song);

    if (get().isShuffling) {
      get()._applyShuffle(song);
    }
    
    get()._registerPlay(song.id);
  },

  togglePlayPause: () => {
    const { isPlaying, currentSong } = get();
    if (!currentSong) return;
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
    set({ isPlaying: !isPlaying });
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  nextSong: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'ONE') {
      set({ isPlaying: true });
      return;
    }

    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'ALL') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    set({
      currentIndex: nextIndex,
      currentSong: nextTrack,
      isPlaying: true
    });
    
    audioService.play(nextTrack);
    get()._registerPlay(nextTrack.id);
  },

  prevSong: () => {
     const { queue, currentIndex, repeatMode } = get();
     if (queue.length === 0) return;

     let prevIndex = currentIndex - 1;

     if (prevIndex < 0) {
        if (repeatMode === 'ALL') {
           prevIndex = queue.length - 1;
        } else {
           prevIndex = 0;
        }
     }

     const prevTrack = queue[prevIndex];
     set({
       currentIndex: prevIndex,
       currentSong: prevTrack,
       isPlaying: true
     });
     
     audioService.play(prevTrack);
     get()._registerPlay(prevTrack.id);
  },

  toggleRepeat: () => {
    set(state => {
      const cycle: Record<RepeatMode, RepeatMode> = {
        'NONE': 'ALL',
        'ALL': 'ONE',
        'ONE': 'NONE'
      };
      return { repeatMode: cycle[state.repeatMode] };
    });
  },

  setProgress: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => {
    set({ volume });
    audioService.setVolume(volume);
  },
  seek: (time) => {
    set({ seekTo: time });
    audioService.seek(time);
  },
  resetSeek: () => set({ seekTo: null }),
  
  addToQueue: (song) => {
    const { queue, originalQueue } = get();
    set({
      queue: [...queue, song],
      originalQueue: [...originalQueue, song]
    });
  },

  addSongsToQueue: (songs) => {
    const { queue, originalQueue } = get();
    set({
      queue: [...queue, ...songs],
      originalQueue: [...originalQueue, ...songs]
    });
  },

  toggleShuffle: () => {
    const { isShuffling, originalQueue, currentSong } = get();
    const newShuffle = !isShuffling;
    
    set({ isShuffling: newShuffle });

    if (!currentSong || originalQueue.length === 0) return;

    if (newShuffle) {
       get()._applyShuffle(currentSong);
    } else {
       const origIndex = originalQueue.findIndex(s => s.id === currentSong.id);
       set({
         queue: [...originalQueue],
         currentIndex: Math.max(0, origIndex)
       });
    }
  },

  
  _registerPlay: (songId) => {
    set(state => {
       const history = state.recentlyPlayed.filter(id => id !== songId);
       history.unshift(songId); // Add to head
       if (history.length > HISTORY_LIMIT) {
          history.pop();
       }
       return { recentlyPlayed: history };
    });
  },

  _applyShuffle: (current) => {
     const { originalQueue, recentlyPlayed } = get();
     if (originalQueue.length <= 1) return;

     const candidates = originalQueue.filter(s => s.id !== current.id);
     
     const fresh = candidates.filter(s => !recentlyPlayed.includes(s.id));
     const stale = candidates.filter(s => recentlyPlayed.includes(s.id));

     const shuffleArray = (array: SongDetail[]) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
     };

     const shuffledTail = [...shuffleArray(fresh), ...shuffleArray(stale)];
     
     set({
       queue: [current, ...shuffledTail],
       currentIndex: 0
     });
  }

}));
