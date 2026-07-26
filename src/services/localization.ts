// FitSync Localization and Translation Dictionaries Service
// Contains translations maps for dashboard headings, navigation links, and settings panels

export type LocaleType = 'en' | 'hi';

export const EN_DICT = {
  // Navigation
  dashboard: 'Dashboard',
  fitness: 'Fitness Tracker',
  friends: 'Social Friends',
  leaderboard: 'Leaderboard',
  challenges: 'Challenges',
  workouts: 'Workout Library',
  ai: 'AI Fitness Coach',
  analytics: 'BI Analytics',
  media: 'Media Library',
  settings: 'Settings',
  control_console: 'Control Console',
  
  // Settings Screen
  settings_header: 'Account Preferences',
  language_label: 'Language Select',
  font_size_label: 'Text Font Size',
  high_contrast_label: 'High Contrast Mode',
  reduce_motion_label: 'Reduce UI Motion',
  save_btn: 'Save Preferences',

  // Common UI
  loading: 'Loading content...',
  save_success: 'Preferences updated successfully!',
  save_failed: 'Failed to update preferences.'
};

export const HI_DICT: typeof EN_DICT = {
  // Navigation
  dashboard: 'डैशबोर्ड',
  fitness: 'फिटनेस ट्रैकर',
  friends: 'सामाजिक मित्र',
  leaderboard: 'लीडरबोर्ड',
  challenges: 'चुनौतियां',
  workouts: 'व्यायाम पुस्तकालय',
  ai: 'एआई फिटनेस कोच',
  analytics: 'बीआई एनालिटिक्स',
  media: 'मीडिया लाइब्रेरी',
  settings: 'समायोजन',
  control_console: 'नियंत्रण कंसोल',

  // Settings Screen
  settings_header: 'खाता प्राथमिकताएं',
  language_label: 'भाषा चुनें',
  font_size_label: 'टेक्स्ट का आकार',
  high_contrast_label: 'उच्च कंट्रास्ट मोड',
  reduce_motion_label: 'मोशन कम करें',
  save_btn: 'प्राथमिकताएं सहेजें',

  // Common UI
  loading: 'सामग्री लोड हो रही है...',
  save_success: 'प्राथमिकताएं सफलतापूर्वक सहेजी गईं!',
  save_failed: 'प्राथमिकताएं सहेजने में विफल।'
};

export const LocalizationService = {
  getTranslation(locale: LocaleType, key: keyof typeof EN_DICT): string {
    const dict = locale === 'hi' ? HI_DICT : EN_DICT;
    return dict[key] || EN_DICT[key] || String(key);
  }
};
export default LocalizationService;
