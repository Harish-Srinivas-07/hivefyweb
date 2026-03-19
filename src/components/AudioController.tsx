'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { offlineAudioManager } from '@/services/offlineAudioManager';

export default function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  
  const { currentSong, isPlaying, nextSong } = usePlayerStore();

  // Handle currentSong changes (source swapping and Auto-Caching logic)
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const loadAndPlay = async () => {
      try {
        // Clean up previous local URL if it exists
        if (objectUrlRef.current) {
           URL.revokeObjectURL(objectUrlRef.current);
           objectUrlRef.current = null;
        }

        // 1. Check Offline/AutoCache first (Offline-First Architecture)
        const localUrl = await offlineAudioManager.getLocalPlaybackUrl(currentSong.id);
        
        if (localUrl) {
           console.log(`[AudioController] Playing local offline blob for ${currentSong.id}`);
           objectUrlRef.current = localUrl;
           audioRef.current!.src = localUrl;
        } else {
           console.log(`[AudioController] Streaming online for ${currentSong.id}`);
           // Fallback to highest quality streaming URL
           if (currentSong.downloadUrls && currentSong.downloadUrls.length > 0) {
              audioRef.current!.src = currentSong.downloadUrls[currentSong.downloadUrls.length - 1].url;
           } else {
              console.warn(`[AudioController] No playable URL for ${currentSong.id}`);
              return;
           }
        }

        audioRef.current!.load();
        
        // Only play if Zustand thinks we should be playing
        if (isPlaying) {
           await audioRef.current!.play().catch(e => {
             if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
               console.error('[AudioController] Auto-play error:', e);
             }
           });
        }

        // Setup MediaSession API for lockscreen/OS controls
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: currentSong.primaryArtists,
            album: currentSong.album || '',
            artwork: currentSong.images ? currentSong.images.map(img => ({
              src: img.url,
              sizes: '500x500', 
              type: 'image/jpeg'
            })) : []
          });
        }
      } catch (e: any) {
         if (e.name !== 'AbortError') {
            console.error('[AudioController] Playback setup error:', e);
         }
      }
    };

    loadAndPlay();

    return () => {
      // Cleanup run when unmounting or switching songs
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [currentSong]); // Note: DO NOT add isPlaying here, it causes double-loads. 

  // Handle Play/Pause toggles separately from Source changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        if (e.name !== 'AbortError') console.error("Play prevented", e);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Throttle updates to localStorage (every 5 seconds) mimicking Dart
  const lastSyncTimeRef = useRef(0);

  const handleTimeUpdate = () => {
     if (!audioRef.current || !currentSong) return;
     const currentTime = audioRef.current.currentTime;
     
     // Every 5 seconds, sync to "LastQueueStorage"
     if (currentTime - lastSyncTimeRef.current > 5) {
         lastSyncTimeRef.current = currentTime;
         // In a robust implementation, write this to localStorage or IndexedDB
         // e.g. localStorage.setItem('lastPlayPosition', currentTime.toString())
         // console.log(`[AudioController] Synced pos ${currentTime}s for ${currentSong.id}`);
     }
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onEnded={() => {
        console.log(`[AudioController] Finished playing ${currentSong?.id}`);
        // Dart Logic: on ended -> silently auto-cache for offline, then skip to next
        if (currentSong) {
           offlineAudioManager.autoCacheSong(currentSong);
        }
        nextSong();
      }}
      onError={(e) => {
         console.error("[AudioController] Audio element error:", e);
      }}
    />
  );
}
