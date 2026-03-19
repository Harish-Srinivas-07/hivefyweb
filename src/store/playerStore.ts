import { create } from 'zustand';
import { SongDetail } from '@/types';

export type RepeatMode = 'NONE' | 'ALL' | 'ONE';

interface PlayerState {
  currentSong: SongDetail | null;
  queue: SongDetail[];
  originalQueue: SongDetail[];
  currentIndex: number;
  
  isPlaying: boolean;
  isShuffling: boolean;
  repeatMode: RepeatMode;
  
  // Weighted shuffle history
  recentlyPlayed: string[]; 

  // Actions
  playSong: (song: SongDetail, queue: SongDetail[]) => void;
  togglePlayPause: () => void;
  setPlaying: (playing: boolean) => void;
  
  nextSong: () => void;
  prevSong: () => void;
  
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Internal/Advanced helpers
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
  
  recentlyPlayed: [],

  playSong: (song, queueContext) => {
    // Determine where the song is in the provided context
    let idx = queueContext.findIndex(s => s.id === song.id);
    if (idx === -1) {
       // Fallback if song somehow isn't in context
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

    // If shuffling is already enabled, we must instantly apply shuffle to the new context
    if (get().isShuffling) {
      get()._applyShuffle(song);
    }
    
    get()._registerPlay(song.id);
  },

  togglePlayPause: () => {
    set(state => {
      if (!state.currentSong) return state; // Can't play if nothing is selected
      return { isPlaying: !state.isPlaying };
    });
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  nextSong: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'ONE') {
      // Just re-triggerplay of current (AudioController handles the actual seek to 0)
      set({ isPlaying: true });
      return;
    }

    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'ALL') {
        nextIndex = 0;
      } else {
        // End of queue, stop playback
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
           // At the very beginning, just reset to 0
           prevIndex = 0;
        }
     }

     const prevTrack = queue[prevIndex];
     set({
       currentIndex: prevIndex,
       currentSong: prevTrack,
       isPlaying: true
     });
     
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

  toggleShuffle: () => {
    const { isShuffling, originalQueue, currentSong } = get();
    if (originalQueue.length === 0 || !currentSong) return;

    if (isShuffling) {
       // Disable shuffle: restore original queue
       const origIndex = originalQueue.findIndex(s => s.id === currentSong.id);
       set({
         isShuffling: false,
         queue: [...originalQueue],
         currentIndex: Math.max(0, origIndex)
       });
    } else {
       // Enable shuffle
       set({ isShuffling: true });
       get()._applyShuffle(currentSong);
    }
  },

  // --- Internal Helpers matching Dart logic ---
  
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

     // Remove current from candidates so it can be forced to index 0
     const candidates = originalQueue.filter(s => s.id !== current.id);
     
     // Separate into fresh vs recently played
     const fresh = candidates.filter(s => !recentlyPlayed.includes(s.id));
     const stale = candidates.filter(s => recentlyPlayed.includes(s.id));

     // Fisher-Yates shuffle generator
     const shuffleArray = (array: SongDetail[]) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
     };

     // Fresh songs get priority, stale songs go to the end
     const shuffledTail = [...shuffleArray(fresh), ...shuffleArray(stale)];
     
     set({
       queue: [current, ...shuffledTail],
       currentIndex: 0
     });
  }

}));
