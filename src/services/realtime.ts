// FitSync Realtime Coordinator Service (Dual Mode: Supabase or Local Mock Fallback)
// Handles connection statuses, browser visible states, offline command queues, and sync retries

import { SessionService } from './session';

type OfflineTask = () => Promise<any>;

class RealtimeServiceCoordinator {
  private isOnlineStatus = true;
  private taskQueue: OfflineTask[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnlineStatus = window.navigator.onLine;

      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  /**
   * Check connection status
   */
  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  /**
   * Queue action when connection is offline
   */
  public async executeOrQueue(task: OfflineTask): Promise<any> {
    if (this.isOnlineStatus) {
      return task();
    } else {
      console.warn('Network offline. Queueing task for reconnect sync.');
      return new Promise((resolve) => {
        this.taskQueue.push(async () => {
          const res = await task();
          resolve(res);
        });
      });
    }
  }

  /**
   * Sync queued actions on reconnect
   */
  private async handleNetworkChange(online: boolean) {
    this.isOnlineStatus = online;
    console.log(`Network status changed: ${online ? 'ONLINE' : 'OFFLINE'}`);

    if (online && this.taskQueue.length > 0) {
      console.log(`Processing ${this.taskQueue.length} queued offline tasks...`);
      const queue = [...this.taskQueue];
      this.taskQueue = [];

      for (const task of queue) {
        try {
          await task();
        } catch (err) {
          console.error('Failed to sync queued offline task:', err);
        }
      }
    }
  }

  /**
   * Update browser session connection details
   */
  public async trackSessionConnection(userId: string, event: 'connected' | 'disconnected' | 'reconnecting') {
    try {
      await SessionService.logConnection(userId, event);
    } catch {}
  }
}

export const RealtimeService = new RealtimeServiceCoordinator();
export default RealtimeService;
