// FitSync Component: ReminderCard
// Renders active fitness reminders with quick toggle sliders and days lists

import React from 'react';
import Card from '../ui/Card';
import type { FitnessReminder } from '../../services/reminder';

interface ReminderCardProps {
  reminder: FitnessReminder;
  onToggleActive: (reminder: FitnessReminder) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggleActive,
  onDelete,
  loading = false
}) => {
  const [updating, setUpdating] = React.useState(false);

  const handleToggle = async () => {
    try {
      setUpdating(true);
      await onToggleActive({
        ...reminder,
        is_active: !reminder.is_active
      });
    } catch {} finally {
      setUpdating(false);
    }
  };

  // Icon matches
  const icons = {
    workout: 'fitness_center',
    water: 'local_drink',
    steps: 'directions_walk',
    sleep: 'bedtime',
    weight: 'monitoring',
    challenge_deadline: 'sports_score'
  };

  return (
    <Card variant="glass" className="p-4 flex items-center justify-between gap-4 text-left border border-slate-200/50 dark:border-slate-800/40 rounded-3xl select-none">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${reminder.is_active ? 'bg-brand-500/10 text-brand-500' : 'bg-slate-100 dark:bg-slate-850 text-slate-400'}`}>
          <span className="material-symbols-outlined text-[1.3em]">
            {icons[reminder.type] || 'alarm'}
          </span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight capitalize">
            {reminder.type.replace('_', ' ')} Reminder
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {reminder.time} • {reminder.days.join(', ')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle slide button */}
        <button
          onClick={handleToggle}
          disabled={updating || loading}
          className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${reminder.is_active ? 'bg-brand-500 flex justify-end' : 'bg-slate-200 dark:bg-slate-800 flex justify-start'}`}
        >
          <span className="w-4 h-4 bg-white rounded-full shadow" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(reminder.id)}
          disabled={updating || loading}
          className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </Card>
  );
};

export default ReminderCard;
