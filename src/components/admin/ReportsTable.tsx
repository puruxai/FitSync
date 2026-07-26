// FitSync Component: ReportsTable
// Displays reported content items list with categorization tags and resolution trigger buttons

import React from 'react';
import Card from '../ui/Card';
import type { ModerationReport } from '../../services/report';
import toast from 'react-hot-toast';

interface ReportsTableProps {
  reports: ModerationReport[];
  onResolve: (id: string, action: 'resolved_approved' | 'resolved_rejected') => Promise<void>;
  loading?: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  onResolve,
  loading = false
}) => {
  const handleResolve = async (id: string, action: 'resolved_approved' | 'resolved_rejected') => {
    try {
      await onResolve(id, action);
      toast.success(action === 'resolved_approved' ? 'Report approved & resolved.' : 'Report dismissed.');
    } catch {
      toast.error('Failed to update report.');
    }
  };

  return (
    <Card variant="glass" className="p-0 overflow-hidden text-left border border-slate-200/50 dark:border-slate-800/40 rounded-3xl select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-slate-500 dark:text-slate-400">
          <thead className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/30">
            <tr>
              <th className="px-6 py-4">Reporter</th>
              <th className="px-6 py-4">Reported User</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Reason Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Resolve Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/20">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-450 font-semibold">
                  No moderation reports in queue.
                </td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/10">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-250">
                    {r.reporter_name || r.reporter_id}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-250">
                    {r.reported_name || r.reported_user_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-450 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {r.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs font-semibold leading-relaxed whitespace-pre-wrap">
                    {r.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black capitalize px-2 py-0.5 rounded-full ${
                      r.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-550'
                        : r.status === 'resolved_approved'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(r.id, 'resolved_approved')}
                          disabled={loading}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black cursor-pointer"
                        >
                          Approve Flag
                        </button>
                        <button
                          onClick={() => handleResolve(r.id, 'resolved_rejected')}
                          disabled={loading}
                          className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-semibold italic">Resolved</span>
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

export default ReportsTable;
