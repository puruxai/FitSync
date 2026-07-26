// FitSync Hook: usePWA
// Captures service worker update triggers and hooks PWA installation prompts

import { useState, useEffect } from 'react';
import { PWAService } from '../services/pwa/pwaService';

export const usePWA = (userId?: string) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Monitor Service Worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA Installation] User accepted installation prompt');
      if (userId) {
        await PWAService.logInstallation(userId, 'Desktop', 'Chrome');
      }
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleUpdateReload = () => {
    window.location.reload();
  };

  return {
    isInstallable,
    isUpdateAvailable,
    triggerInstall,
    handleUpdateReload
  };
};

export default usePWA;
