// Unit tests for Capacitor Android native capability services
// File: src/test/android.test.ts

import { describe, it, expect } from 'vitest';
import { DeviceFeatureService } from '../services/native/device';
import { BiometricAuthService } from '../services/native/biometrics';
import { NativeNotificationService } from '../services/native/notifications';

describe('Capacitor Android Native services', () => {
  it('DeviceFeatureService returns fallback details on Web browser', async () => {
    const info = await DeviceFeatureService.getDeviceInfo();
    expect(info.os).toBeDefined();
    expect(info.model).toBeDefined();
  });

  it('BiometricAuthService evaluates authentications triggers', async () => {
    const available = await BiometricAuthService.isAvailable();
    expect(available).toBe(false); // Fails secure on non-mobile sessions
  });

  it('NativeNotificationService requests push consent status', async () => {
    const granted = await NativeNotificationService.requestPermission();
    expect(granted).toBeDefined();
  });
});
