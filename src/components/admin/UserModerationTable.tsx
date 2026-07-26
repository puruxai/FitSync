// FitSync Component: UserModerationTable
// Renders user catalog with role assign selections, verified badges triggers, and suspension buttons

import React, { useState } from 'react';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

interface UserModerationTableProps {
  users: any[];
  onSuspend: (id: string, reason: string) => Promise<void>;
  onUnban: (id: string) => Promise<void>;
  onVerify: (id: string, type: 'verified_trainer' | 'verified_nutritionist' | 'none') => Promise<void>;
  onAssignRole: (id: string, role: string) => Promise<void>;
  loading?: boolean;
}

export const UserModerationTable: React.FC<UserModerationTableProps> = ({
  users,
  onSuspend,
  onUnban,
  onVerify,
  onAssignRole,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReasonUser, setActiveReasonUser] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (u.full_name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
  });

  const handleSuspendSubmit = async (userId: string) => {
    if (!suspendReason.trim()) return;
    try {
      await onSuspend(userId, suspendReason);
      setSuspendReason('');
      setActiveReasonUser(null);
      toast.success('User suspended.');
    } catch {
      toast.error('Failed to suspend user.');
    }
  };

  return (
    <Card variant="glass" className="p-0 overflow-hidden text-left border border-slate-200/50 dark:border-slate-800/40 rounded-3xl select-none">
      
      {/* Search toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/30 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
        <div className="relative w-72">
          <input
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-slate-500 dark:text-slate-400">
          <thead className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/30">
            <tr>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Bio / Status</th>
              <th className="px-6 py-4">Verified Badges</th>
              <th className="px-6 py-4">Assign Role</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/20">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-450 font-semibold">
                  No user profiles found.
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/10">
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-white">
                    {u.full_name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-400">
                    @{u.username}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate font-semibold">
                    {u.bio || <span className="text-[9px] text-slate-350 italic">No status</span>}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      onChange={(e) => onVerify(u.id, e.target.value as any)}
                      className="px-2 py-1 text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white focus:outline-none"
                    >
                      <option value="none">Standard user</option>
                      <option value="verified_trainer">Verified Trainer</option>
                      <option value="verified_nutritionist">Verified Nutritionist</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      onChange={(e) => onAssignRole(u.id, e.target.value)}
                      className="px-2 py-1 text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg dark:text-white focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {activeReasonUser === u.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          placeholder="Reason..."
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          className="px-2 py-1 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleSuspendSubmit(u.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-[10px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setActiveReasonUser(null)}
                          className="text-[9px] text-slate-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveReasonUser(u.id)}
                          disabled={loading}
                          className="px-2.5 py-1 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => onUnban(u.id)}
                          disabled={loading}
                          className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          Unban
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UserModerationTable;
