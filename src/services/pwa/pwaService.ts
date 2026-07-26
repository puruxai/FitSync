// FitSync PWA Service
// Manages service worker registrations, PWA installations audit logs, and version checks

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export const PWAService = {
  /**
   * Registers PWA Service Worker
   */
  registerServiceWorker(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA sw.js] Registered successfully:', registration.scope);
          })
          .catch((err) => {
            console.error('[PWA sw.js] Registration failed:', err);
          });
      });
    }
  },

  /**
   * Log installation to audit database
   */
  async logInstallation(userId: string, os: string, browser: string): Promise<void> {
    const payload = {
      user_id: userId,
      device_os: os,
      browser_name: browser
    };

    if (isSupabaseConfigured) {
      await supabase.from('pwa_installations').insert(payload);
    } else {
      const list = getFromMockDb<any>('pwa_installations');
      list.push({
        id: 'inst-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        installed_at: new Date().toISOString()
      });
      saveToMockDb('pwa_installations', list);
    }
  }
};
export default PWAService;
