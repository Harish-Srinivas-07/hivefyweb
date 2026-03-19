import { Howl, Howler } from 'howler';
import { SongDetail, SourceUrl } from '@/types';
import { offlineAudioManager } from './offlineAudioManager';

type AudioEvent = 'play' | 'pause' | 'end' | 'error' | 'stop' | 'load' | 'loading' | 'progress';

export class AudioService {
  private static instance: AudioService;
  private howl: Howl | null = null;
  private currentSong: SongDetail | null = null;
  private eventListeners: Map<AudioEvent, Set<Function>> = new Map();
  private progressInterval: any = null;

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

    this.currentSong = song;
    this.emit('loading', true);

    try {
      const localUrl = await offlineAudioManager.getLocalPlaybackUrl(song.id);
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
          this.startProgressPolling();
        },
        onpause: () => {
          this.emit('pause', null);
          this.stopProgressPolling();
        },
        onend: () => {
          this.emit('end', null);
          this.stopProgressPolling();
        },
        onload: () => {
          this.emit('load', this.howl?.duration());
          this.emit('loading', false);
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

  stop() {
    this.stopProgressPolling();
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

  private emit(event: AudioEvent, data: any) {
    this.eventListeners.get(event)?.forEach(cb => cb(data));
  }

  private startProgressPolling() {
    this.stopProgressPolling();
    this.progressInterval = setInterval(() => {
      this.emit('progress', this.getCurrentTime());
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
