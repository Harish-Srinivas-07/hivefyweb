'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { audioService } from '@/services/AudioService';
import { offlineAudioManager } from '@/services/offlineAudioManager';
import { SourceUrl } from '@/types';

export default function AudioController() {
  const { 
    currentSong, 
    nextSong, 
    setProgress, 
    setDuration, 
    setPlaying
  } = usePlayerStore();

  useEffect(() => {
    const offProgress = audioService.on('progress', (time: number) => setProgress(time));
    const offLoad = audioService.on('load', (duration: number) => setDuration(duration));
    const offPlay = audioService.on('play', () => setPlaying(true));
    const offPause = audioService.on('pause', () => setPlaying(false));
    const offEnd = audioService.on('end', () => {
      if (currentSong) offlineAudioManager.autoCacheSong(currentSong);
      nextSong();
    });
    const offError = audioService.on('error', (err: any) => {
      console.error('[AudioController] Playback error:', err);
      setPlaying(false);
    });

    return () => {
      offProgress();
      offLoad();
      offPlay();
      offPause();
      offEnd();
      offError();
    };
  }, [currentSong, setProgress, setDuration, setPlaying, nextSong]);

  useEffect(() => {
    if (!currentSong) return;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || '',
        artist: currentSong.artist || 'Unknown Artist',
        album: (typeof currentSong.album === 'object' ? currentSong.album?.name : currentSong.album) || '',
        artwork: currentSong.images ? currentSong.images.map((img: SourceUrl) => ({
          src: img.url,
          sizes: '500x500', 
          type: 'image/jpeg'
        })) : []
      });

      navigator.mediaSession.setActionHandler('play', () => audioService.resume());
      navigator.mediaSession.setActionHandler('pause', () => audioService.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().prevSong());
      navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().nextSong());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          audioService.seek(details.seekTime);
        }
      });
    }
  }, [currentSong]);

  return null; // No hidden <audio> tag needed anymore!
}
