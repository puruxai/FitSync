// FitSync Component: WorkoutHistoryTable
// Displays lists of completed workout sessions with statistics and completion indicators

import React from 'react';
import Card from '../ui/Card';
import type { WorkoutHistoryItem } from '../../services/workoutHistory';

interface WorkoutHistoryTableProps {
  history: WorkoutHistoryItem[];
}

export const WorkoutHistoryTable: React.FC<WorkoutHistoryTableProps> = ({ history }) => {
  return (
    <Card variant="glass" className="p-0 overflow-hidden text-left border border-slate-200/50 dark:border-slate-800/40 rounded-3xl select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-slate-500 dark:text-slate-400">
          <thead className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/30">
            <tr>
              <th className="px-6 py-4">Workout Session</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Calories Burned</th>
              <th className="px-6 py-4">Completions</th>
              <th className="px-6 py-4">Exercises Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/20">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold">
                  No completed workouts history found.
                </td>
              </tr>
            ) : (
              history.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/10">
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-white">
                    {item.workout_name}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {new Date(item.logged_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-350">
                    {item.duration_minutes} mins
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-500">
                    {item.calories_burned} kcal
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 rounded-full" 
                          style={{ width: `${item.completion_percent}%` }}
                        />
                      </div>
                      <span className="font-bold text-[10px]">{item.completion_percent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {item.exercises_completed} completed
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

export default WorkoutHistoryTable;
