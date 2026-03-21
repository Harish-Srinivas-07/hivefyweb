import localforage from 'localforage';
import { SongDetail } from '@/types';

const offlineSongsStore = localforage.createInstance({
  name: 'hivefyWeb',
  storeName: 'offline_songs',
  description: 'Explicitly downloaded MP3 Blobs'
});

const autoCacheStore = localforage.createInstance({
  name: 'hivefyWeb',
  storeName: 'auto_cached_songs',
  description: 'FIFO cached MP3 Blobs from playback'
});

const MAX_AUTO_CACHE_SONGS = 50;

export const offlineAudioManager = {
  /**
   * Download a song explicitly and save as Blob
   */
  async downloadSong(song: SongDetail, onProgress?: (progress: number) => void): Promise<boolean> {
    if (!song.downloadUrls || song.downloadUrls.length === 0) return false;
    
    try {
      const url = song.downloadUrls[song.downloadUrls.length - 1].url;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get readable stream');

      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;

        if (total && onProgress) {
           onProgress((loaded / total) * 100);
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'audio/mp4' }); // JioSaavn typically returns m4a/mp4
      await offlineSongsStore.setItem(song.id, blob);
      
      await autoCacheStore.removeItem(song.id);
      
      return true;
    } catch (error) {
      console.error(`Failed to download song ${song.id}:`, error);
      return false;
    }
  },

  /**
   * Silently cache a song after it finishes playing (FIFO logic)
   */
  async autoCacheSong(song: SongDetail): Promise<void> {
    if (await this.isAvailableOffline(song.id) || await this.isAutoCached(song.id)) {
        return;
    }

    if (!song.downloadUrls || song.downloadUrls.length === 0) return;

    try {
      const url = song.downloadUrls[song.downloadUrls.length - 1].url;
      const response = await fetch(url);
      if (!response.ok) return;

      const blob = await response.blob();
      
      const keys = await autoCacheStore.keys();
      if (keys.length >= MAX_AUTO_CACHE_SONGS) {
        const oldestKey = keys[0];
        await autoCacheStore.removeItem(oldestKey);
        console.log(`[OfflineManager] FIFO Cache limit reached. Removed: ${oldestKey}`);
      }

      await autoCacheStore.setItem(song.id, blob);
      console.log(`[OfflineManager] Successfully auto-cached: ${song.id}`);

    } catch (error) {
       console.warn(`[OfflineManager] Auto-cache failed for ${song.id}:`, error);
    }
  },

  /**
   * Get the local Object URL for playback if it exists. MUST call URL.revokeObjectURL when done.
   */
  async getLocalPlaybackUrl(songId: string): Promise<string | null> {
    try {
      let blob = await offlineSongsStore.getItem<Blob>(songId);
      
      if (!blob) {
         blob = await autoCacheStore.getItem<Blob>(songId);
      }

      if (blob) {
        return URL.createObjectURL(blob);
      }

      return null;
    } catch (error) {
      console.error(`Failed to get local URL for ${songId}:`, error);
      return null;
    }
  },

  /**
   * Remove explicitly downloaded song
   */
  async deleteSong(songId: string): Promise<void> {
     await offlineSongsStore.removeItem(songId);
  },

  /**
   * Checks explicit offline store
   */
  async isAvailableOffline(songId: string): Promise<boolean> {
      const keys = await offlineSongsStore.keys();
      return keys.includes(songId);
  },
  
  /**
   * Checks auto-cache store
   */
  async isAutoCached(songId: string): Promise<boolean> {
      const keys = await autoCacheStore.keys();
      return keys.includes(songId);
  }
};
