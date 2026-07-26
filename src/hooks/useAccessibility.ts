// FitSync Hook: useAccessibility
// Manages and applies High Contrast, Font size scale, and Reduced Motion preferences

import { useState, useEffect, useCallback } from 'react';
import { AccessibilityService, type AccessibilityConfig } from '../services/accessibility';

export const useAccessibility = () => {
  const [config, setConfigState] = useState<AccessibilityConfig>({
    fontSize: 'normal',
    highContrast: false,
    reduceMotion: false
  });

  useEffect(() => {
    const active = AccessibilityService.getConfig();
    setConfigState(active);
    AccessibilityService.applyAccessibilitySettings(active);
  }, []);

  const saveConfig = useCallback((newConfig: AccessibilityConfig) => {
    AccessibilityService.saveConfig(newConfig);
    setConfigState(newConfig);
  }, []);

  return {
    config,
    saveConfig
  };
};

export default useAccessibility;
