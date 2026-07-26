// FitSync Component: PrivacyToggle
// Renders options for profile visibility and granular privacy locks for weight, height, age, online status, and progress metrics

import React from 'react';
import Card from '../ui/Card';

interface PrivacyToggleProps {
  visibility: 'public' | 'friends' | 'private';
  hideWeight: boolean;
  hideHeight: boolean;
  hideAge: boolean;
  hideOnlineStatus: boolean;
  hideProgress: boolean;
  onChange: (field: string, value: any) => void;
  loading?: boolean;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  visibility,
  hideWeight,
  hideHeight,
  hideAge,
  hideOnlineStatus,
  hideProgress,
  onChange,
  loading = false
}) => {
  const toggleItem = (
    _id: string,
    title: string,
    desc: string,
    icon: string,
    checked: boolean,
    field: string
  ) => {
    return (
      <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 text-left">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-[1.4em] text-slate-400 mt-0.5">{icon}</span>
          <div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-white">{title}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-normal">{desc}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            disabled={loading}
            onChange={e => onChange(field, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-550" />
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Visibility selector */}
      <Card variant="glass" className="p-5 text-left">
        <div className="flex gap-3 mb-4">
          <span className="material-symbols-outlined text-[1.4em] text-slate-400">visibility</span>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">Profile Visibility</h3>
            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Control who can discover and view your dashboard metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {(['public', 'friends', 'private'] as const).map(option => (
            <button
              key={option}
              type="button"
              disabled={loading}
              onClick={() => onChange('profile_visibility', option)}
              className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                visibility === option
                  ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {option === 'friends' ? 'Friends Only' : option}
            </button>
          ))}
        </div>
      </Card>

      {/* Granular switches */}
      <Card variant="glass" className="p-5">
        <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1.5 text-left">Hide Metrics from Others</h3>
        <p className="text-[10px] text-slate-400 font-semibold mb-4 text-left">Configure locks to keep specific biometrics and data private.</p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {toggleItem('t-weight', 'Hide Weight', 'Hide weight readings from public profile feeds.', 'scale', hideWeight, 'hide_weight')}
          {toggleItem('t-height', 'Hide Height', 'Keep height measurements visible only to you.', 'straighten', hideHeight, 'hide_height')}
          {toggleItem('t-age', 'Hide Age', 'Conceal age and birthday stats from other athletes.', 'cake', hideAge, 'hide_age')}
          {toggleItem('t-online', 'Hide Online Status', 'Disable public online status green rings.', 'sensors', hideOnlineStatus, 'hide_online_status')}
          {toggleItem('t-progress', 'Hide Progress Metrics', 'Do not share steps, calories, or logs in social feeds.', 'bar_chart', hideProgress, 'share_fitness')}
        </div>
      </Card>
    </div>
  );
};

export default PrivacyToggle;
