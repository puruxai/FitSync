// FitSync Hook: useSecurity
// Coordinates credentials changes, login alerts settings, and trusted devices lists

import { useState, useEffect, useCallback } from 'react';
import { SecurityService, type SecuritySettings, type TrustedDevice } from '../services/security';

export const useSecurity = (userId?: string) => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSecurityData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const s = await SecurityService.getSettings(userId);
      setSettings(s);
      
      const d = await SecurityService.getTrustedDevices(userId);
      setDevices(d);
    } catch (err) {
      console.error('Failed to load security settings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const changePassword = async (pass: string) => {
    await SecurityService.changePassword(pass);
  };

  const updateSettings = async (updates: Partial<Omit<SecuritySettings, 'profile_id' | 'updated_at'>>) => {
    if (!userId) return;
    await SecurityService.updateSettings(userId, updates);
    setSettings(prev => prev ? { ...prev, ...updates } : null);
  };

  const addTrustedDevice = async (name: string) => {
    if (!userId) return;
    await SecurityService.addTrustedDevice(userId, name);
    await fetchSecurityData();
  };

  const removeTrustedDevice = async (id: string) => {
    await SecurityService.removeTrustedDevice(id);
    await fetchSecurityData();
  };

  return {
    settings,
    devices,
    loading,
    changePassword,
    updateSettings,
    addTrustedDevice,
    removeTrustedDevice,
    refetch: fetchSecurityData
  };
};

export default useSecurity;
