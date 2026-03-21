import localforage from 'localforage';
import { Playlist, Album } from '@/types';

const IS_BROWSER = typeof window !== 'undefined';

const historyStore = IS_BROWSER ? localforage.createInstance({
  name: 'hivefyWeb',
  storeName: 'history',
  description: 'Stores recently visited playlists and albums'
}) : null;

export interface HistoryItem {
  id: string;
  name: string;
  title?: string;
  type: 'playlist' | 'album';
  images: any[];
  artist?: string;
  primaryArtists?: string;
  timestamp: number;
}

const MAX_HISTORY = 10;

export const historyService = {
  async addVisited(item: Playlist | Album, type: 'playlist' | 'album') {
    if (!historyStore) return;
    try {
      const historyItem: HistoryItem = {
        id: item.id,
        name: item.name || (item as any).title || '',
        title: (item as any).title || item.name || '',
        type,
        images: (item as any).images || item.image || [],
        artist: (item as any).artist || '',
        primaryArtists: (item as any).primaryArtists || '',
        timestamp: Date.now()
      };

      const existing = await this.getHistory();
      const filtered = existing.filter(i => i.id !== item.id);
      
      const newHistory = [historyItem, ...filtered].slice(0, MAX_HISTORY);
      await historyStore.setItem('recent_visited', newHistory);
    } catch (e) {
      console.warn("Failed to save history:", e);
    }
  },

  async getHistory(): Promise<HistoryItem[]> {
    if (!historyStore) return [];
    try {
      return await historyStore.getItem<HistoryItem[]>('recent_visited') || [];
    } catch (e) {
      console.warn("Failed to get history:", e);
      return [];
    }
  },

  async clearHistory() {
    if (!historyStore) return;
    await historyStore.clear();
  }
};
