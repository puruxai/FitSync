// FitSync Component: WorkoutPlannerCalendar
// Displays weekly days columns with scheduled workouts slots and delete actions

import React from 'react';
import Card from '../ui/Card';
import type { PlannedWorkout } from '../../services/planner';
import type { Workout } from '../../services/workout';

interface WorkoutPlannerCalendarProps {
  schedule: PlannedWorkout[];
  workouts: Workout[];
  onAssignWorkout: (workoutId: string, day: PlannedWorkout['day_of_week'], time: string) => Promise<void>;
  onRemoveWorkout: (scheduleId: string) => Promise<void>;
  loading?: boolean;
}

export const WorkoutPlannerCalendar: React.FC<WorkoutPlannerCalendarProps> = ({
  schedule,
  workouts,
  onAssignWorkout,
  onRemoveWorkout,
  loading = false
}) => {
  const days: PlannedWorkout['day_of_week'][] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Group schedules by day
  const scheduleByDay = React.useMemo(() => {
    const map = new Map<string, PlannedWorkout[]>();
    days.forEach(d => map.set(d, []));
    schedule.forEach(s => {
      const arr = map.get(s.day_of_week) || [];
      arr.push(s);
      map.set(s.day_of_week, arr);
    });
    return map;
  }, [schedule]);

  const [activeDay, setActiveDay] = React.useState<PlannedWorkout['day_of_week'] | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('07:00');

  const handleAdd = async (day: PlannedWorkout['day_of_week']) => {
    if (!selectedWorkoutId) return;
    try {
      await onAssignWorkout(selectedWorkoutId, day, selectedTime);
      setSelectedWorkoutId('');
      setActiveDay(null);
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-left select-none">
      {days.map(day => {
        const items = scheduleByDay.get(day) || [];

        return (
          <Card 
            key={day} 
            variant="glass" 
            className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex flex-col justify-between min-h-60"
          >
            <div>
              <h4 className="text-xs font-black text-slate-855 dark:text-white border-b border-slate-105 dark:border-slate-800/40 pb-2 mb-3">
                {day}
              </h4>

              <div className="space-y-2.5">
                {items.length === 0 ? (
                  <p className="text-[9px] text-slate-400 font-semibold py-4 text-center">Rest Day</p>
                ) : (
                  items.map(s => {
                    const wk = s.workout;
                    if (!wk) return null;

                    return (
                      <div 
                        key={s.id} 
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/20 relative group"
                      >
                        <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight pr-4 truncate">
                          {wk.title}
                        </h5>
                        <p className="text-[8px] text-slate-400 mt-0.5">{s.time_of_day || '07:00'} • {wk.duration}m</p>
                        
                        <button
                          onClick={() => onRemoveWorkout(s.id)}
                          disabled={loading}
                          className="absolute top-1.5 right-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[10px]">close</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick add slot */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/30">
              {activeDay === day ? (
                <div className="space-y-2">
                  <select
                    value={selectedWorkoutId}
                    onChange={(e) => setSelectedWorkoutId(e.target.value)}
                    className="w-full px-2 py-1.5 text-[9px] font-semibold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-lg focus:outline-none dark:text-white"
                  >
                    <option value="">Select workout...</option>
                    {workouts.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="px-2 py-1 text-[9px] font-semibold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-lg focus:outline-none dark:text-white flex-1"
                    />
                    <button
                      onClick={() => handleAdd(day)}
                      className="px-2.5 py-1 bg-brand-500 text-white text-[9px] font-black rounded-lg hover:bg-brand-600 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <button 
                    onClick={() => setActiveDay(null)} 
                    className="text-[8px] text-slate-400 hover:underline block text-center w-full"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveDay(day)}
                  className="w-full py-1 border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-400 hover:text-brand-500 rounded-xl text-[9px] font-bold transition-all cursor-pointer"
                >
                  + Add Workout
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default WorkoutPlannerCalendar;
