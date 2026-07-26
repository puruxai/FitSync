// FitSync Hook: useStorage
// Retrieves active quota statistics and bytes consumed from database buckets

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb } from '../services/mockDb';

export interface StorageUsageData {
  bytesUsed: number;
  quotaBytes: number;
}

export const useStorage = (userId?: string) => {
  const [usage, setUsage] = useState<StorageUsageData>({ bytesUsed: 0, quotaBytes: 1073741824 });
  const [loading, setLoading] = useState(false);

  const fetchUsage = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('storage_usage')
          .select('bytes_used, quota_bytes')
          .eq('profile_id', userId)
          .maybeSingle();

        if (data) {
          setUsage({
            bytesUsed: Number(data.bytes_used),
            quotaBytes: Number(data.quota_bytes)
          });
        }
      } else {
        const list = getFromMockDb<any>('storage_usage');
        const found = list.find(u => u.profile_id === userId);
        if (found) {
          setUsage({
            bytesUsed: Number(found.bytes_used || 245000000),
            quotaBytes: Number(found.quota_bytes || 1073741824)
          });
        } else {
          setUsage({ bytesUsed: 180000000, quotaBytes: 1073741824 });
        }
      }
    } catch (err) {
      console.error('Failed to load storage usage:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    loading,
    refetch: fetchUsage
  };
};

export default useStorage;
