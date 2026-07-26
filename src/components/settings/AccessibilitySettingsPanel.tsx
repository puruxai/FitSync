// FitSync Component: AccessibilitySettingsPanel
// Form dashboard to toggle language locales, font scales, contrast levels, and motion settings

import React from 'react';
import Card from '../ui/Card';
import { useLocale } from '../../hooks/useLocale';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';

export const AccessibilitySettingsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { config, saveConfig } = useAccessibility();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'en' | 'hi';
    setLocale(lang);
    toast.success(lang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है।' : 'Language changed to English.');
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveConfig({
      ...config,
      fontSize: e.target.value as any
    });
    toast.success('Font size configuration updated.');
  };

  const handleContrastToggle = () => {
    saveConfig({
      ...config,
      highContrast: !config.highContrast
    });
    toast.success(`High contrast mode ${!config.highContrast ? 'enabled' : 'disabled'}`);
  };

  const handleMotionToggle = () => {
    saveConfig({
      ...config,
      reduceMotion: !config.reduceMotion
    });
    toast.success(`Reduce motion mode ${!config.reduceMotion ? 'enabled' : 'disabled'}`);
  };

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-6">
      <div className="space-y-0.5 border-b border-slate-100 dark:border-slate-800/30 pb-3">
        <h3 className="text-sm font-black text-slate-855 dark:text-white uppercase tracking-wider">{t('settings_header')}</h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          Configure WCAG-compliant preferences including screen-readers labels, text resizing, contrast levels, and fallback motions.
        </p>
      </div>

      <div className="space-y-5">
        
        {/* Language select */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('language_label')}</label>
          <select
            value={locale}
            onChange={handleLanguageChange}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
          >
            <option value="en">English (US)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>

        {/* Font scale select */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('font_size_label')}</label>
          <select
            value={config.fontSize}
            onChange={handleFontSizeChange}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
          >
            <option value="normal">Normal (14px)</option>
            <option value="large">Large (16px)</option>
            <option value="extra-large">Extra Large (18px)</option>
          </select>
        </div>

        {/* Contrast toggles */}
        <div className="flex justify-between items-center pt-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t('high_contrast_label')}</span>
            <p className="text-[9px] text-slate-400 font-semibold leading-none">Improves line readability on light background dials</p>
          </div>
          <button
            onClick={handleContrastToggle}
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${config.highContrast ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${config.highContrast ? 'translate-x-4.5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Reduce motion toggles */}
        <div className="flex justify-between items-center pt-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t('reduce_motion_label')}</span>
            <p className="text-[9px] text-slate-400 font-semibold leading-none">Disables sliding transitions and heavy keyframes animations</p>
          </div>
          <button
            onClick={handleMotionToggle}
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${config.reduceMotion ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${config.reduceMotion ? 'translate-x-4.5' : 'translate-x-0'}`} />
          </button>
        </div>

      </div>
    </Card>
  );
};

export default AccessibilitySettingsPanel;
