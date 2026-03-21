import localforage from 'localforage';

const IS_BROWSER = typeof window !== 'undefined';

const apiCacheStore = IS_BROWSER ? localforage.createInstance({
  name: 'hivefyWeb',
  storeName: 'api_cache',
  description: 'Caches JioSaavn API JSON responses'
}) : null;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlSeconds: number;
}

export const cacheService = {
  /**
   * Set data in cache with a time-to-live
   */
  async setCache<T>(key: string, data: T, ttlSeconds: number = 86400): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttlSeconds
      };
      if (apiCacheStore) {
         await apiCacheStore.setItem(key, entry);
      }
    } catch (error) {
      console.warn(`Failed to set cache for key ${key}:`, error);
    }
  },

  /**
   * Get data from cache. Returns null if missing or expired.
   */
  async getCache<T>(key: string): Promise<T | null> {
    try {
      if (!apiCacheStore) return null;
      const entry = await apiCacheStore.getItem<CacheEntry<T>>(key);
      if (!entry) return null;

      const now = Date.now();
      const ageSeconds = (now - entry.timestamp) / 1000;

      if (ageSeconds > entry.ttlSeconds) {
        await this.removeCache(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn(`Failed to get cache for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a specific key from cache
   */
  async removeCache(key: string): Promise<void> {
    try {
      if (apiCacheStore) {
         await apiCacheStore.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove cache key ${key}:`, error);
    }
  },

  /**
   * Clear the entire API cache
   */
  async clearAll(): Promise<void> {
    try {
      if (apiCacheStore) {
         await apiCacheStore.clear();
      }
    } catch (error) {
      console.warn('Failed to clear API cache:', error);
    }
  }
};
