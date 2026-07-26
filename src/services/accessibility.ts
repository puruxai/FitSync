// FitSync Accessibility Settings Service
// Manages document class bindings for High Contrast, Font size scale, and Reduced Motion preferences

export interface AccessibilityConfig {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'fs_accessibility_settings';

const DEFAULT_CONFIG: AccessibilityConfig = {
  fontSize: 'normal',
  highContrast: false,
  reduceMotion: false
};

export const AccessibilityService = {
  /**
   * Load accessibility config
   */
  getConfig(): AccessibilityConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_CONFIG;
      return JSON.parse(data);
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  /**
   * Save and apply config
   */
  saveConfig(config: AccessibilityConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    this.applyAccessibilitySettings(config);
  },

  /**
   * Applies CSS classes to document html node
   */
  applyAccessibilitySettings(config: AccessibilityConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Font Size
    root.classList.remove('text-large', 'text-extra-large');
    if (config.fontSize === 'large') root.classList.add('text-large');
    if (config.fontSize === 'extra-large') root.classList.add('text-extra-large');

    // 2. High Contrast
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Reduce Motion
    if (config.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }
};
export default AccessibilityService;
