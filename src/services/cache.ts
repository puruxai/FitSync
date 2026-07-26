// FitSync Memory and Session Cache Service
// Implements key-value caching with TTL expiration to reduce redundant network queries

interface CacheItem<T> {
  value: T;
  expiry: number;
}

export const CacheService = {
  /**
   * Set item in cache
   */
  set<T>(key: string, value: T, ttlSeconds = 300): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    const item: CacheItem<T> = { value, expiry };
    try {
      sessionStorage.setItem(`fs_cache_${key}`, JSON.stringify(item));
    } catch {
      // Storage full or disabled
    }
  },

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    try {
      const data = sessionStorage.getItem(`fs_cache_${key}`);
      if (!data) return null;

      const item: CacheItem<T> = JSON.parse(data);
      if (Date.now() > item.expiry) {
        sessionStorage.removeItem(`fs_cache_${key}`);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  /**
   * Clear cache item
   */
  remove(key: string): void {
    sessionStorage.removeItem(`fs_cache_${key}`);
  },

  /**
   * Flush entire cache
   */
  clear(): void {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('fs_cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};
export default CacheService;
