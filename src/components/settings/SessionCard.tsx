// FitSync Component: SessionCard
// Renders active login device sessions list with OS types, browser footprints, IP locations, and revoke actions

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { UserSession } from '../../services/session';
import toast from 'react-hot-toast';

interface SessionCardProps {
  sessions: UserSession[];
  onRevoke: (id: string) => Promise<void>;
  onRevokeAll: () => Promise<void>;
  loading?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  sessions,
  onRevoke,
  onRevokeAll,
  loading = false
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  const handleRevoke = async (id: string) => {
    try {
      setSubmitting(true);
      await onRevoke(id);
      toast.success('Session access revoked.');
    } catch {
      toast.error('Failed to revoke session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Are you sure you want to log out all other devices?')) return;
    try {
      setSubmitting(true);
      await onRevokeAll();
      toast.success('All other sessions revoked.');
    } catch {
      toast.error('Failed to revoke sessions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-855 dark:text-white leading-tight">
            Active Device Sessions
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Devices that are currently logged in to your account.
          </p>
        </div>

        {sessions.length > 1 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRevokeAll}
            disabled={submitting || loading}
          >
            Log Out Other Devices
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map(s => (
          <div 
            key={s.id} 
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              s.is_current 
                ? 'border-brand-500/20 bg-brand-500/[0.01]' 
                : 'border-slate-200/40 dark:border-slate-800/30 bg-slate-50/50 dark:bg-slate-850/10'
            }`}
          >
            <div className="flex gap-3 text-left">
              <span className={`material-symbols-outlined text-2xl p-2 rounded-xl h-fit ${s.is_current ? 'text-brand-500 bg-brand-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-850'}`}>
                {s.os.toLowerCase().includes('ios') || s.os.toLowerCase().includes('android') ? 'smartphone' : 'desktop_windows'}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">
                    {s.browser} on {s.os}
                  </h4>
                  {s.is_current && (
                    <span className="text-[7px] font-black uppercase bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded border border-brand-500/20">
                      Current
                    </span>
                  )}
                </div>
                
                <p className="text-[9px] text-slate-400 font-semibold mt-1">
                  IP: {s.ip_address || 'Unknown'} • Location: {s.location || 'Unknown'}
                </p>
                <span className="text-[8px] text-slate-405 font-bold block mt-1.5">
                  Logged in: {new Date(s.login_time).toLocaleString()}
                </span>
              </div>
            </div>

            {!s.is_current && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRevoke(s.id)}
                disabled={submitting || loading}
                className="border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-500/20 dark:border-slate-850"
              >
                Revoke
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SessionCard;
