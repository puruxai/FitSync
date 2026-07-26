// FitSync Hook: useLocale
// Manages loading and setting active language locales

import { useState, useEffect, useCallback } from 'react';
import type { LocaleType } from '../services/localization';

export const useLocale = () => {
  const [locale, setLocaleState] = useState<LocaleType>('en');

  useEffect(() => {
    const cached = localStorage.getItem('fs_locale') as LocaleType;
    if (cached === 'en' || cached === 'hi') {
      setLocaleState(cached);
    }
  }, []);

  const setLocale = useCallback((newLocale: LocaleType) => {
    localStorage.setItem('fs_locale', newLocale);
    setLocaleState(newLocale);
    window.dispatchEvent(new Event('localeChange'));
  }, []);

  return {
    locale,
    setLocale
  };
};

export default useLocale;
