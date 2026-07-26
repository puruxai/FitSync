// FitSync Component: HistoryTable
// A reusable component that displays tabular records for step counts, workouts, weights, and water logs with options to delete entries

import React from 'react';
import Badge from '../ui/Badge';

interface HistoryItem {
  id: string;
  title: string;
  subtitle: string;
  value: string | number;
  date: string;
  notes?: string;
  badgeText?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger';
}

interface HistoryTableProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
  loading?: boolean;
  emptyText?: string;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  items,
  onDelete,
  loading = false,
  emptyText = 'No logs registered in history.'
}) => {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        <span className="material-symbols-outlined text-4xl mb-2 text-slate-500">inventory_2</span>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto text-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
            <th className="py-3.5 px-4">Activity details</th>
            <th className="py-3.5 px-4 text-right">Reading / Metric</th>
            <th className="py-3.5 px-4 text-right">Date</th>
            <th className="py-3.5 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
              <td className="py-4 px-4">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-bold text-slate-900 dark:text-white leading-tight">{item.title}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.subtitle}</span>
                  {item.notes && (
                    <span className="text-[9px] text-slate-405 dark:text-slate-450 italic mt-1 font-medium">{item.notes}</span>
                  )}
                </div>
              </td>
              
              <td className="py-4 px-4 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-black text-slate-800 dark:text-slate-200">{item.value}</span>
                  {item.badgeText && (
                    <Badge variant={item.badgeVariant || 'primary'} size="sm">
                      {item.badgeText}
                    </Badge>
                  )}
                </div>
              </td>

              <td className="py-4 px-4 text-right font-semibold text-slate-450 dark:text-slate-400">
                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>

              <td className="py-4 px-4 text-center">
                <button
                  disabled={loading}
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Delete log record"
                >
                  <span className="material-symbols-outlined text-[1.25em]">delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
