// FitSync Component: PreferencePanel
// Displays grid settings toggles for muting notification categories and configuring email channels

import React from 'react';
import Card from '../ui/Card';
import type { NotificationPreferences } from '../../services/preference';

interface PreferencePanelProps {
  preferences: NotificationPreferences;
  onUpdate: (updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id'>>) => Promise<void>;
  loading?: boolean;
}

export const PreferencePanel: React.FC<PreferencePanelProps> = ({
  preferences,
  onUpdate,
  loading = false
}) => {
  const settingsList = [
    { key: 'mute_friend', label: 'Friend Request Alerts', desc: 'Mute alerts when someone sends or accepts a friend connection' },
    { key: 'mute_challenge', label: 'Challenge Invites', desc: 'Mute invites to steps/workout challenges' },
    { key: 'mute_workout', label: 'Workout Logs & Activities', desc: 'Mute alerts about daily physical targets progress' },
    { key: 'mute_reminder', label: 'Habit Reminders', desc: 'Mute hydration, weight checks, and steps alarm warnings' },
    { key: 'mute_leaderboard', label: 'Leaderboard standings alerts', desc: 'Mute alerts about rank upgrades/drops' },
    { key: 'mute_achievement', label: 'Badges & Achievements', desc: 'Mute awards and XP achievements details' },
    { key: 'mute_system', label: 'System Updates & Info', desc: 'Mute announcements from system moderators' },
    { key: 'email_enabled', label: 'Email Notifications', desc: 'Receive summaries of missed workout logs in inbox', inverted: true }
  ];

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      await onUpdate({
        [key]: !currentValue
      });
    } catch (err) {
      console.error('Failed to save settings toggle:', err);
    }
  };

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-850 dark:text-white leading-tight">
          Alert Configurations
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold mt-1">
          Customize when you receive alerts. Muted types are dropped silently.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/30">
        {settingsList.map((item) => {
          const val = (preferences as any)[item.key] || false;
          // Inverted display if email (so toggle is "Active/Green" when enabled instead of "Active/Green" when muted)
          const displayChecked = item.inverted ? val : !val;

          return (
            <div key={item.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                  {item.label}
                </label>
                <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block mt-0.5">
                  {item.desc}
                </span>
              </div>

              <button
                onClick={() => handleToggle(item.key, val)}
                disabled={loading}
                className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${displayChecked ? 'bg-brand-500 flex justify-end' : 'bg-slate-200 dark:bg-slate-800 flex justify-start'}`}
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

export default PreferencePanel;
