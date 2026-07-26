// FitSync Capacitor Local Notifications scheduler
// Registers push hooks and schedules local workout calendar reminders

export const NativeNotificationService = {
  /**
   * Request push alerts permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && !(window as any).Capacitor) {
        return true;
      }

      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Schedules immediate local alert notification
   */
  async triggerLocalAlert(title: string, body: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && !(window as any).Capacitor) {
        console.log(`[Alert Notification] Title: ${title}, Body: ${body}`);
        return;
      }

      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 10000),
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav'
          }
        ]
      });
    } catch {
      console.warn('Failed to schedule local notification');
    }
  }
};

export default NativeNotificationService;
