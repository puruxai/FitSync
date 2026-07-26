// FitSync Component: DangerZone
// Renders options to deactivate profiles, request recoveries, or delete account logs

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface DangerZoneProps {
  onDeactivate: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  loading?: boolean;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  onDeactivate,
  onDeleteAccount,
  loading = false
}) => {
  const [submitting, setSubmitting] = useState<'deactivate' | 'delete' | null>(null);

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? You will be logged out and your profile will be hidden.')) return;
    try {
      setSubmitting('deactivate');
      await onDeactivate();
      toast.success('Account deactivated.');
    } catch {
      toast.error('Failed to deactivate account.');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('WARNING: THIS IS IRREVERSIBLE. Are you sure you want to permanently delete your FitSync account? All workout history, logs, and challenge details will be erased.')) return;
    if (!window.confirm('Type "DELETE" in the prompt to confirm.')) return;
    
    try {
      setSubmitting('delete');
      await onDeleteAccount();
      toast.success('Account deleted.');
    } catch {
      toast.error('Failed to delete account.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Card variant="glass" className="p-5 border border-red-500/20 dark:border-red-950/30 rounded-3xl text-left select-none space-y-5 bg-red-500/[0.01]">
      <div>
        <h3 className="text-sm font-black text-red-500 leading-tight">
          Danger Zone
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold mt-1">
          Irreversible account actions. Please exercise caution.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/30">
        
        {/* Deactivate */}
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
          <div className="min-w-0 flex-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Deactivate Account
            </label>
            <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block mt-0.5">
              Temporarily hide your profile cards and rankings. You can reactivate by logging back in.
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDeactivate}
            disabled={submitting !== null || loading}
            isLoading={submitting === 'deactivate'}
            className="border-slate-200 text-slate-500 hover:text-slate-800 dark:border-slate-850"
          >
            Deactivate
          </Button>
        </div>

        {/* Delete */}
        <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
          <div className="min-w-0 flex-1">
            <label className="text-xs font-bold text-red-500 block">
              Permanently Delete Account
            </label>
            <span className="text-[9px] text-slate-400 font-semibold leading-relaxed block mt-0.5">
              Instantly wipe all your step logs, friendship requests, and challenge standings from our databases.
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleDelete}
            disabled={submitting !== null || loading}
            isLoading={submitting === 'delete'}
            className="bg-red-500 hover:bg-red-600 text-white shadow shadow-red-500/10"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DangerZone;
