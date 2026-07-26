// FitSync Capacitor Native Device & Share Integration Service
// Accesses device hardware parameters and clipboard APIs

export const DeviceFeatureService = {
  /**
   * Retrieves native device system info
   */
  async getDeviceInfo(): Promise<{ os: string; model: string; version: string }> {
    try {
      // Mocked fallback for Web sessions
      if (typeof window !== 'undefined' && !(window as any).Capacitor) {
        return {
          os: 'Web',
          model: 'BrowserSession',
          version: '1.0.0'
        };
      }
      
      // Dynamic import to prevent bundler failures on non-Capacitor targets
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      return {
        os: info.platform,
        model: info.model,
        version: info.osVersion
      };
    } catch {
      return { os: 'unknown', model: 'unknown', version: '0.0.0' };
    }
  },

  /**
   * Triggers native sharing portal
   */
  async shareText(title: string, text: string, url?: string): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, url, dialogTitle: 'Share FitSync Stat' });
    } catch {
      console.warn('Sharing not supported on this platform');
    }
  },

  /**
   * Copy payload value to Clipboard
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const { Clipboard } = await import('@capacitor/clipboard');
      await Clipboard.write({ string: text });
    } catch {
      console.warn('Clipboard write failed');
    }
  }
};

export default DeviceFeatureService;
