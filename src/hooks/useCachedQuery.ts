// FitSync Hook: useCachedQuery
// Fetches data from client-side memory storage cache first, reducing network cost

import { useState, useEffect, useCallback } from 'react';
import { CacheService } from '../services/cache';

export const useCachedQuery = <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 120
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const query = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = CacheService.get<T>(cacheKey);
      if (cached !== null) {
        setData(cached);
        return;
      }
    }

    try {
      setLoading(true);
      const res = await fetchFn();
      CacheService.set(cacheKey, res, ttlSeconds);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn, ttlSeconds]);

  useEffect(() => {
    query();
  }, [query]);

  return {
    data,
    loading,
    error,
    refetch: () => query(true)
  };
};

export default useCachedQuery;
