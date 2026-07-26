// FitSync Hook: useLogs
// Manages database log telemetry fetches for admin audit views

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb } from '../services/mockDb';

export const useLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('system_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setLogs(data || []);
      } else {
        const list = getFromMockDb<any>('system_logs');
        setLogs([...list].reverse().slice(0, 50));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    refetch: fetchLogs
  };
};

export default useLogs;
