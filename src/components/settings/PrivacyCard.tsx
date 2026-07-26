// FitSync Component: PrivacyCard
// Renders granular privacy toggles for profile visibility, age, weight, workout logs, and online status

import React from 'react';
import Card from '../ui/Card';
import type { PrivacySettings } from '../../services/privacy';

interface PrivacyCardProps {
  privacy: PrivacySettings;
  onUpdate: (updates: Partial<Omit<PrivacySettings, 'profile_id' | 'updated_at'>>) => Promise<any>;
  loading?: boolean;
}

export const PrivacyCard: React.FC<PrivacyCardProps> = ({
  privacy,
  onUpdate,
  loading = false
}) => {
  const toggles = [
    { key: 'share_fitness', label: 'Share Fitness Activity', desc: 'Allow others to view step summaries and workout totals' },
    { key: 'hide_age', label: 'Hide Age', desc: 'Hide your age from profiles pages' },
    { key: 'hide_weight', label: 'Hide Weight', desc: 'Hide your current weight metric' },
    { key: 'hide_height', label: 'Hide Height', desc: 'Hide your height details' },
    { key: 'hide_bmi', label: 'Hide BMI', desc: 'Hide body mass index calculations' },
    { key: 'hide_workout_history', label: 'Hide Workout History', desc: 'Make completed workout logs private' },
    { key: 'hide_friend_list', label: 'Hide Friend Connections', desc: 'Hide your friends list from other profiles' },
    { key: 'hide_challenges', label: 'Hide Challenges', desc: 'Hide your challenge participation details' },
    { key: 'hide_leaderboard_ranking', label: 'Hide Leaderboard Ranks', desc: 'Prevent display on global podiums' },
    { key: 'hide_online_status', label: 'Hide Presence status', desc: 'Hide whether you are currently online' },
    { key: 'hide_last_seen', label: 'Hide Last Seen time', desc: 'Hide last seen date metrics' },
    { key: 'hide_activity_feed', label: 'Hide Activity Feed logs', desc: 'Hide completions achievements from social feeds' }
  ];

  const handleToggle = async (key: string, val: boolean) => {
    try {
      await onUpdate({
        [key]: !val
      });
    } catch {}
  };

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-5">
      <div>
        <h3 className="text-sm font-black text-slate-855 dark:text-white leading-tight">
          Granular Privacy Locks
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold mt-1">
          Configure what details are visible on your profile page.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Profile Visibility</label>
        <select
          value={privacy.profile_visibility}
          onChange={(e) => onUpdate({ profile_visibility: e.target.value as any })}
          className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
        >
          <option value="public">Public (Everyone can search/view)</option>
          <option value="friends">Friends Only (Approved friends only)</option>
          <option value="private">Private (Only you can view)</option>
        </select>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/30">
        {toggles.map(t => {
          const val = (privacy as any)[t.key] || false;
          return (
            <div key={t.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                  {t.label}
                </label>
                <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block mt-0.5">
                  {t.desc}
                </span>
              </div>

              <button
                onClick={() => handleToggle(t.key, val)}
                disabled={loading}
                className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${val ? 'bg-brand-500 flex justify-end' : 'bg-slate-200 dark:bg-slate-800 flex justify-start'}`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PrivacyCard;
