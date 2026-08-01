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
      let bytesUsed = 0;
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('media_files')
          .select('file_size')
          .eq('user_id', userId);
        if (data) {
          bytesUsed = data.reduce((sum, f) => sum + Number(f.file_size || 0), 0);
        }
      } else {
        const list = getFromMockDb<any>('media_files');
        const userFiles = list.filter(f => f.user_id === userId);
        bytesUsed = userFiles.reduce((sum, f) => sum + Number(f.file_size || 0), 0);
      }
      setUsage({
        bytesUsed,
        quotaBytes: 1073741824
      });
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
