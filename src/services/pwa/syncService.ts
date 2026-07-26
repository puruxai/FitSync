// FitSync Synchronization Service
// Flushes queued modifications once internet is restored and writes logs in sync_history

import { OfflineService } from './offlineService';
import { FitnessService } from '../fitness';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';
import toast from 'react-hot-toast';

export const SyncService = {
  /**
   * Sync queued offline actions to database
   */
  async syncOfflineData(userId: string): Promise<void> {
    const queue = OfflineService.getQueue();
    if (queue.length === 0) return;

    toast.loading('Synchronizing offline logs...', { id: 'pwa-sync' });

    let successCount = 0;

    for (const item of queue) {
      try {
        if (item.actionType === 'update_steps') {
          // Process steps sync
          await FitnessService.logSteps(userId, item.payload.steps, item.payload.caloriesBurned || 0);
          successCount++;
        }
      } catch (err) {
        console.error('Failed to sync offline item:', item, err);
      }
    }

    // Save sync audit logs
    const historyPayload = {
      user_id: userId,
      synced_items_count: successCount,
      status: successCount === queue.length ? ('success' as const) : ('failed' as const)
    };

    if (isSupabaseConfigured) {
      await supabase.from('sync_history').insert(historyPayload);
    } else {
      const history = getFromMockDb<any>('sync_history');
      history.push({
        id: 'syn-' + Math.random().toString(36).substr(2, 9),
        ...historyPayload,
        created_at: new Date().toISOString()
      });
      saveToMockDb('sync_history', history);
    }

    OfflineService.clearQueue();
    toast.success(`Successfully synchronized ${successCount} items!`, { id: 'pwa-sync' });
  }
};
export default SyncService;
