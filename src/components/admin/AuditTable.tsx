// FitSync Component: AuditTable
// Renders timeline rows for system logins, account deactivations, and role modifications

import React from 'react';
import Card from '../ui/Card';
import type { AuditLog } from '../../services/audit';

interface AuditTableProps {
  logs: AuditLog[];
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs }) => {
  return (
    <Card variant="glass" className="p-0 overflow-hidden text-left border border-slate-200/50 dark:border-slate-800/40 rounded-3xl select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-slate-500 dark:text-slate-400">
          <thead className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/30">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action Event</th>
              <th className="px-6 py-4">Operator</th>
              <th className="px-6 py-4">Target / Reason Details</th>
              <th className="px-6 py-4">IP Footprint</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/20">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-450 font-semibold">
                  No system audit logs found.
                </td>
              </tr>
            ) : (
              logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/10">
                  <td className="px-6 py-4 font-semibold">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[8px] font-black bg-brand-500/10 text-brand-650 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {l.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-250">
                    {l.user_name || 'System Operator'}
                  </td>
                  <td className="px-6 py-4 max-w-sm truncate font-semibold">
                    {l.details || 'None'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-400">
                    {l.ip_address || '127.0.0.1'}
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

export default AuditTable;
