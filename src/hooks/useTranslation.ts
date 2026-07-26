// FitSync Hook: useTranslation
// Returns translation matching the current locale settings

import { useState, useEffect, useCallback } from 'react';
import { LocalizationService, type LocaleType, type EN_DICT } from '../services/localization';

export const useTranslation = () => {
  const [locale, setLocale] = useState<LocaleType>('en');

  const updateLocale = useCallback(() => {
    const cached = localStorage.getItem('fs_locale') as LocaleType;
    if (cached === 'en' || cached === 'hi') {
      setLocale(cached);
    }
  }, []);

  useEffect(() => {
    updateLocale();
    window.addEventListener('localeChange', updateLocale);
    return () => window.removeEventListener('localeChange', updateLocale);
  }, [updateLocale]);

  const t = useCallback((key: keyof typeof EN_DICT): string => {
    return LocalizationService.getTranslation(locale, key);
  }, [locale]);

  return {
    t,
    locale
  };
};

export default useTranslation;
