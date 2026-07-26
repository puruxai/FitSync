// FitSync Component: SecurityCard
// Handles changing passwords, login alert toggles, and listing trusted devices footprints

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { SecuritySettings, TrustedDevice } from '../../services/security';
import toast from 'react-hot-toast';

interface SecurityCardProps {
  settings: SecuritySettings;
  devices: TrustedDevice[];
  onUpdateSettings: (updates: Partial<Omit<SecuritySettings, 'profile_id' | 'updated_at'>>) => Promise<void>;
  onChangePassword: (pass: string) => Promise<void>;
  onRemoveDevice: (id: string) => Promise<void>;
  loading?: boolean;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  settings,
  devices,
  onUpdateSettings,
  onChangePassword,
  onRemoveDevice,
  loading = false
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await onChangePassword(newPassword);
      toast.success('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAlerts = async () => {
    try {
      await onUpdateSettings({
        login_alerts_enabled: !settings.login_alerts_enabled
      });
      toast.success('Security settings updated!');
    } catch {}
  };

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Settings switches */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-855 dark:text-white leading-tight">
            Security Configurations
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Toggle account security and access options.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 py-1">
          <div className="min-w-0 flex-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
              Login Alerts
            </label>
            <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block mt-0.5">
              Receive in-app messages when a new device logs in
            </span>
          </div>

          <button
            onClick={handleToggleAlerts}
            disabled={loading}
            className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${settings.login_alerts_enabled ? 'bg-brand-500 flex justify-end' : 'bg-slate-200 dark:bg-slate-800 flex justify-start'}`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>
      </Card>

      {/* Change Password form */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4">
        <h3 className="text-sm font-black text-slate-855 dark:text-white">Change Credentials</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting} isLoading={submitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Trusted Devices list */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-855 dark:text-white leading-tight">
            Trusted Devices ({devices.length})
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Browser sessions that don't trigger verification prompts.
          </p>
        </div>

        <div className="space-y-3">
          {devices.length === 0 ? (
            <p className="text-slate-400 text-xs py-4 text-center">No trusted devices registered.</p>
          ) : (
            devices.map(d => (
              <div 
                key={d.id} 
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/20 rounded-2xl"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 leading-tight">
                    {d.device_name}
                  </h4>
                  <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">
                    Trusted on: {new Date(d.trusted_at).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => onRemoveDevice(d.id)}
                  disabled={loading}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Remove Device"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default SecurityCard;
