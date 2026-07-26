// FitSync Offline Queue Service
// Buffers workout updates, daily steps, and water intake adjustments into storage queue when offline

import { getFromMockDb, saveToMockDb } from '../mockDb';

export interface QueuedAction {
  id: string;
  actionType: string;
  payload: any;
  createdAt: string;
}

export const OfflineService = {
  /**
   * Queue action when offline
   */
  queueAction(actionType: string, payload: any): void {
    const queue = getFromMockDb<QueuedAction>('offline_queue');
    const newAction: QueuedAction = {
      id: 'off-' + Math.random().toString(36).substr(2, 9),
      actionType,
      payload,
      createdAt: new Date().toISOString()
    };
    queue.push(newAction);
    saveToMockDb('offline_queue', queue);
    console.log(`[Offline Engine] Queued action: ${actionType}`);
  },

  /**
   * Get pending queued items
   */
  getQueue(): QueuedAction[] {
    return getFromMockDb<QueuedAction>('offline_queue');
  },

  /**
   * Clear processed items from queue
   */
  clearQueue(): void {
    saveToMockDb('offline_queue', []);
  }
};
export default OfflineService;
