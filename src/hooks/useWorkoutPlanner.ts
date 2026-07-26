// FitSync Hook: useWorkoutPlanner
// Handles loading workout plans list, scheduling day items, and duplicating active plans

import { useState, useEffect, useCallback } from 'react';
import { PlannerService, type WorkoutPlan, type PlannedWorkout } from '../services/planner';

export const useWorkoutPlanner = (userId?: string) => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [schedule, setSchedule] = useState<PlannedWorkout[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlanner = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const planList = await PlannerService.getPlans(userId);
      setPlans(planList);
      
      const active = planList.find(p => p.is_active) || planList[0] || null;
      setCurrentPlan(active);

      if (active) {
        const sched = await PlannerService.getPlannedWorkouts(active.id);
        setSchedule(sched);
      }
    } catch (err) {
      console.error('Failed to load planner:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPlanner();
  }, [loadPlanner]);

  const selectPlan = async (plan: WorkoutPlan) => {
    setCurrentPlan(plan);
    try {
      setLoading(true);
      const sched = await PlannerService.getPlannedWorkouts(plan.id);
      setSchedule(sched);
    } catch {} finally {
      setLoading(false);
    }
  };

  const createPlan = async (title: string, description?: string) => {
    if (!userId) return;
    const res = await PlannerService.createPlan(userId, title, description);
    await loadPlanner();
    return res;
  };

  const deletePlan = async (planId: string) => {
    await PlannerService.deletePlan(planId);
    await loadPlanner();
  };

  const duplicatePlan = async (planId: string, newTitle: string) => {
    const res = await PlannerService.duplicatePlan(planId, newTitle);
    await loadPlanner();
    return res;
  };

  const assignWorkout = async (workoutId: string, day: PlannedWorkout['day_of_week'], time: string) => {
    if (!currentPlan) return;
    await PlannerService.assignWorkout(currentPlan.id, workoutId, day, time);
    // Reload schedule
    const sched = await PlannerService.getPlannedWorkouts(currentPlan.id);
    setSchedule(sched);
  };

  const removeWorkout = async (scheduleId: string) => {
    if (!currentPlan) return;
    await PlannerService.deletePlannedWorkout(scheduleId);
    // Reload schedule
    const sched = await PlannerService.getPlannedWorkouts(currentPlan.id);
    setSchedule(sched);
  };

  return {
    plans,
    currentPlan,
    schedule,
    loading,
    selectPlan,
    createPlan,
    deletePlan,
    duplicatePlan,
    assignWorkout,
    removeWorkout,
    refetch: loadPlanner
  };
};

export default useWorkoutPlanner;
