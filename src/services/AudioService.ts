import { Howl, Howler } from 'howler';
import { SongDetail, SourceUrl } from '@/types';
import { offlineAudioManager } from './offlineAudioManager';

type AudioEvent = 'play' | 'pause' | 'end' | 'error' | 'stop' | 'load' | 'loading' | 'progress' | 'next' | 'prev';

export class AudioService {
  private static instance: AudioService;
  private howl: Howl | null = null;
  private currentSong: SongDetail | null = null;
  private eventListeners: Map<AudioEvent, Set<Function>> = new Map();
  private progressInterval: any = null;
  private pendingSongId: string | null = null;

  private constructor() {
    Howler.autoUnlock = true;
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async play(song: SongDetail) {
    if (this.currentSong?.id === song.id && this.howl) {
      if (this.howl.state() === 'loaded') {
        this.howl.play();
        return;
      }
    }

    // Stop and unload previous
    this.stop();

    this.pendingSongId = song.id;
    this.currentSong = song;
    this.emit('loading', true);

    try {
      const localUrl = await offlineAudioManager.getLocalPlaybackUrl(song.id);
      
      // If we've switched songs during the async fetch, ignore this one
      if (this.pendingSongId !== song.id) {
        console.log('[AudioService] Skipping stale play request for:', song.id);
        return;
      }
      let src: string;
      
      if (localUrl) {
        src = localUrl;
      } else if (song.downloadUrls && song.downloadUrls.length > 0) {
        src = song.downloadUrls[song.downloadUrls.length - 1].url;
      } else {
        console.error('[AudioService] No playable URL found for song:', song);
        throw new Error('No playable URL found');
      }

      this.howl = new Howl({
        src: [src],
        html5: true, // Force HTML5 for streaming large files
        format: ['mp3', 'm4a', 'mp4'],
        onplay: () => {
          this.emit('play', null);
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
          
          // Sync PiP Video State
          if (typeof window !== 'undefined') {
             const { pipService } = require('./pipService');
             if (pipService) pipService.syncPlaybackState(true);
          }
          
          this.startProgressPolling();
        },
        onpause: () => {
          this.emit('pause', null);
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
          
          // Sync PiP Video State
          if (typeof window !== 'undefined') {
             const { pipService } = require('./pipService');
             if (pipService) pipService.syncPlaybackState(false);
          }
          
          this.stopProgressPolling();
        },
        onend: () => {
          this.emit('end', null);
          this.stopProgressPolling();
        },
        onload: () => {
          this.emit('load', this.howl?.duration());
          this.emit('loading', false);
          this.updateMediaPositionState();
        },
        onloaderror: (id, err) => {
          console.error('[AudioService] Load error:', err);
          this.emit('error', err);
          this.emit('loading', false);
        },
        onplayerror: (id, err) => {
          console.error('[AudioService] Play error:', err);
          this.emit('error', err);
          this.howl?.once('unlock', () => this.howl?.play());
        }
      });

      this.updateMediaSessionMetadata(song);
      this.setupMediaSessionActions();
      this.howl.play();
    } catch (error) {
      console.error('[AudioService] Setup error:', error);
      this.emit('error', error);
      this.emit('loading', false);
    }
  }

  pause() {
    this.howl?.pause();
  }

  resume() {
    this.howl?.play();
  }

  isPlaying(): boolean {
    return this.howl?.playing() || false;
  }

  stop() {
    this.stopProgressPolling();
    this.pendingSongId = null;
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
    this.currentSong = null;
    this.emit('stop', null);
  }

  seek(seconds: number) {
    if (this.howl) {
      this.howl.seek(seconds);
    }
  }

  setVolume(volume: number) {
    Howler.volume(volume);
  }

  getDuration(): number {
    return this.howl?.duration() || 0;
  }

  getCurrentTime(): number {
    return (this.howl?.seek() as number) || 0;
  }

  on(event: AudioEvent, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
    return () => this.off(event, callback);
  }

  off(event: AudioEvent, callback: Function) {
    this.eventListeners.get(event)?.delete(callback);
  }

  private setupMediaSessionActions() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.max(this.getCurrentTime() - skipTime, 0));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.min(this.getCurrentTime() + skipTime, this.getDuration()));
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => this.emit('prev', null));
      navigator.mediaSession.setActionHandler('nexttrack', () => this.emit('next', null));
      
      // Update position state for PiP/System UI
      this.updateMediaPositionState();
    }
  }

  private updateMediaSessionMetadata(song: SongDetail) {
    if ('mediaSession' in navigator) {
      const images = Array.isArray(song.images) ? song.images : (Array.isArray(song.image) ? song.image : []);
      const artwork = images.map(img => ({
        src: (img as any).url || (img as any).link || '',
        sizes: '500x500',
        type: 'image/jpeg'
      }));

      const artistName = song.artist || 
                       (Array.isArray(song.artists?.primary) ? song.artists.primary[0]?.name : '') || 
                       'Unknown Artist';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title || song.name || 'Unknown Title',
        artist: artistName,
        album: song.albumName || song.album?.name || 'Unknown Album',
        artwork: artwork
      });

      // Update PiP Art and Metadata if active
      if (typeof window !== 'undefined') {
         const { pipService } = require('./pipService');
         if (pipService) {
            const img = (song.images?.[song.images.length-1]?.url as any) || 
                        (song.image?.[song.image?.length-1]?.url as any) || 
                        artwork[0]?.src || '';
            pipService.updateMetadata(img, song.title || song.name, artistName);
         }
      }
    }
  }

  private updateMediaPositionState() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: this.getDuration(),
          playbackRate: 1.0,
          position: this.getCurrentTime()
        });
      } catch (e) {
        // Silently ignore if duration is not yet available
      }
    }
  }

  private emit(event: AudioEvent, data: any) {
    this.eventListeners.get(event)?.forEach(cb => cb(data));
  }

  private startProgressPolling() {
    this.stopProgressPolling();
    this.progressInterval = setInterval(() => {
      const currentTime = this.getCurrentTime();
      this.emit('progress', currentTime);
      // Keep PiP/System UI in sync every few seconds or on significant progress
      this.updateMediaPositionState();
    }, 1000);
  }

  private stopProgressPolling() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export const audioService = AudioService.getInstance();
