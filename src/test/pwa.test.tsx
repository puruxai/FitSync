// Unit tests for PWA and Offline hooks
// File: src/test/pwa.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../hooks/useOffline';
import { usePWA } from '../hooks/usePWA';

describe('PWA & Offline hooks', () => {
  it('useOffline tracks online/offline state changes', () => {
    const { result } = renderHook(() => useOffline());

    // Default status matches navigator status
    expect(result.current.isOnline).toBe(navigator.onLine);

    // Simulate offline trigger
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    // Simulate online trigger
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });

  it('usePWA manages install prompt indicators', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isUpdateAvailable).toBe(false);

    // Simulate beforeinstallprompt event trigger
    const mockEvent = new Event('beforeinstallprompt') as any;
    mockEvent.preventDefault = vi.fn();
    
    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.isInstallable).toBe(true);
  });
});
