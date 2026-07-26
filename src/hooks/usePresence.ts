// FitSync Hook: usePresence
// Tracks window/tab focus shifts, browser online status, and connection sync handlers

import { useEffect, useState } from 'react';
import { PresenceService } from '../services/presence';
import { RealtimeService } from '../services/realtime';

export const usePresence = (userId?: string) => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // 1. Initial online status presence sync
    PresenceService.setPresence(userId, 'online');
    RealtimeService.trackSessionConnection(userId, 'connected');

    const handleVisibility = () => {
      if (document.hidden) {
        PresenceService.setPresence(userId, 'away');
      } else {
        PresenceService.setPresence(userId, 'online');
      }
    };

    const handleOnline = () => {
      setOnline(true);
      PresenceService.setPresence(userId, 'online');
      RealtimeService.trackSessionConnection(userId, 'connected');
    };

    const handleOffline = () => {
      setOnline(false);
      PresenceService.setPresence(userId, 'offline');
      RealtimeService.trackSessionConnection(userId, 'disconnected');
    };

    // 2. Event bindings
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Cleanup on close/unload
    const handleUnload = () => {
      PresenceService.setPresence(userId, 'offline');
      RealtimeService.trackSessionConnection(userId, 'disconnected');
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [userId]);

  return {
    isNetworkOnline: online
  };
};

export default usePresence;
