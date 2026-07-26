// FitSync Hook: useOnlineStatus
// Manages real-time status indicators (online, offline, away, working_out) with polling/realtime fallbacks

import { useState, useEffect, useCallback } from 'react';
import { OnlineStatusService } from '../services/online';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { OnlineStatus } from '../types';

export const useOnlineStatus = (profileId?: string, trackIds: string[] = []) => {
  const [currentStatus, setCurrentStatus] = useState<'online' | 'offline' | 'away' | 'working_out'>('offline');
  const [trackedStatuses, setTrackedStatuses] = useState<Record<string, OnlineStatus>>({});

  // 1. Fetch our own presence and tracked profiles' statuses
  const fetchStatuses = useCallback(async () => {
    if (!profileId) return;
    try {
      const own = await OnlineStatusService.getStatus(profileId);
      setCurrentStatus((own.status || 'offline') as any);

      if (trackIds.length > 0) {
        const statusesList = await OnlineStatusService.getStatuses(trackIds);
        const map: Record<string, OnlineStatus> = {};
        statusesList.forEach(s => {
          map[s.profile_id] = s;
        });
        setTrackedStatuses(map);
      }
    } catch (err) {
      console.error('Failed to load online statuses:', err);
    }
  }, [profileId, JSON.stringify(trackIds)]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // 2. Set up realtime listeners in Supabase mode or periodic updates in offline fallback
  useEffect(() => {
    if (!profileId) return;

    let subscription: any;

    if (isSupabaseConfigured) {
      // Subscribe to database changes on online_status
      subscription = supabase
        .channel('online_presence_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'online_status' },
          (payload) => {
            const row = payload.new as OnlineStatus;
            if (row) {
              if (row.profile_id === profileId) {
                setCurrentStatus((row.status || 'offline') as any);
              }
              if (trackIds.includes(row.profile_id)) {
                setTrackedStatuses(prev => ({
                  ...prev,
                  [row.profile_id]: row
                }));
              }
            }
          }
        )
        .subscribe();
    } else {
      // Polling fallback every 10s for mock database
      const interval = setInterval(fetchStatuses, 10000);
      return () => clearInterval(interval);
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [profileId, JSON.stringify(trackIds), fetchStatuses]);

  // 3. Update status method
  const updateStatus = async (status: 'online' | 'offline' | 'away' | 'working_out') => {
    if (!profileId) return;
    try {
      await OnlineStatusService.updateStatus(profileId, status);
      setCurrentStatus(status);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return {
    status: currentStatus,
    trackedStatuses,
    updateStatus,
    refetch: fetchStatuses
  };
};

export default useOnlineStatus;
