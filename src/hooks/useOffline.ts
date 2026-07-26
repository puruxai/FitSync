// FitSync Hook: useOffline
// Listens to network connectivity events and returns online/offline states

import { useState, useEffect } from 'react';
import { SyncService } from '../services/pwa/syncService';
import toast from 'react-hot-toast';

export const useOffline = (userId?: string) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored! Syncing...');
      if (userId) {
        SyncService.syncOfflineData(userId);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Working Offline. Modifications will be synchronized later.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  return {
    isOnline
  };
};

export default useOffline;
