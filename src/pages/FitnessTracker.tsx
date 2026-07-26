// FitSync Page: FitnessTracker
// Consolidates steps tracking, water intake, weight/BMI calculations, exercises history, and goals customization

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useSteps } from '../hooks/useSteps';
import { useWater } from '../hooks/useWater';
import { useWeight } from '../hooks/useWeight';
import { useWorkout } from '../hooks/useWorkout';
import { useGoals } from '../hooks/useGoals';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import FitnessCard from '../components/fitness/FitnessCard';
import StatisticsChart from '../components/fitness/StatisticsChart';
import HistoryTable from '../components/fitness/HistoryTable';

// Validation schemas
const workoutSchema = z.object({
  workoutName: z.string().min(2, 'Name must be at least 2 characters.'),
  category: z.string().min(2, 'Select a valid category.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  calories: z.coerce.number().min(1, 'Calories must be greater than 0.'),
  intensity: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional()
});

const weightSchema = z.object({
  weightKg: z.coerce.number().min(30, 'Weight must be at least 30 kg.').max(300, 'Weight cannot exceed 300 kg.')
});

const goalsSchema = z.object({
  stepsGoal: z.coerce.number().min(1000, 'Goal must be at least 1,000 steps.'),
  caloriesGoal: z.coerce.number().min(500, 'Goal must be at least 500 kcal.'),
  workoutGoal: z.coerce.number().min(5, 'Goal must be at least 5 minutes.'),
  waterGoal: z.coerce.number().min(500, 'Goal must be at least 500 ml.'),
  weightGoal: z.coerce.number().min(30).optional()
});

type WorkoutForm = z.infer<typeof workoutSchema>;
type WeightForm = z.infer<typeof weightSchema>;
type GoalsForm = z.infer<typeof goalsSchema>;

export const FitnessTracker: React.FC = () => {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'workouts' | 'steps' | 'water' | 'weight' | 'goals'>('workouts');

  // Modals visibility
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);

  // Hook invocations
  const { logs: stepLogs, logSteps, deleteStepLog, loading: stepLoading } = useSteps(profile?.id);
  const { logs: waterLogs, logWater, deleteWaterLog, goal: waterGoal, todayTotal: todayWater, loading: waterLoading } = useWater(profile?.id);
  const { logs: weightLogs, logWeight, deleteWeightLog, latestBmi, bmiCategory, bmiSuggestion, weightChange, loading: weightLoading } = useWeight(profile?.id, profile?.height || 175);
  const { history: workoutLogs, logWorkout, deleteWorkoutLog, loading: workoutLoading } = useWorkout(profile?.id);
  const { goals, updateGoals, loading: goalsLoading } = useGoals(profile?.id);

  // Forms
  const { register: registerWorkout, handleSubmit: handleSubmitWorkout, reset: resetWorkout, formState: { errors: wErrors } } = useForm<WorkoutForm>({
    resolver: zodResolver(workoutSchema) as any,
    defaultValues: { intensity: 'medium' }
  });

  const { register: registerWeight, handleSubmit: handleSubmitWeight, reset: resetWeight, formState: { errors: wtErrors } } = useForm<WeightForm>({
    resolver: zodResolver(weightSchema) as any
  });

  const { register: registerSteps, handleSubmit: handleSubmitSteps, reset: resetSteps } = useForm<{ manualSteps: number }>();
  
  const { register: registerGoals, handleSubmit: handleSubmitGoals, setValue: setGoalValue } = useForm<GoalsForm>({
    resolver: zodResolver(goalsSchema) as any
  });

  // Pre-fill goals form when tab opens
  React.useEffect(() => {
    if (goals) {
      setGoalValue('stepsGoal', goals.steps_goal);
      setGoalValue('caloriesGoal', goals.calories_goal);
      setGoalValue('workoutGoal', goals.workout_minutes_goal);
      setGoalValue('waterGoal', goals.water_ml_goal);
      setGoalValue('weightGoal', goals.weight_goal);
    }
  }, [goals, activeTab]);

  // Submission handlers
  const handleWorkoutSubmit = async (data: WorkoutForm) => {
    try {
      await logWorkout({
        name: data.workoutName,
        category: data.category,
        duration_minutes: data.duration,
        calories_burned: data.calories,
        intensity: data.intensity,
        notes: data.notes
      });
      setShowWorkoutModal(false);
      resetWorkout();
    } catch {}
  };

  const handleWeightSubmit = async (data: WeightForm) => {
    try {
      await logWeight(data.weightKg);
      setShowWeightModal(false);
      resetWeight();
    } catch {}
  };

  const handleStepsSubmit = async (data: { manualSteps: number }) => {
    try {
      await logSteps(Number(data.manualSteps));
      setShowStepsModal(false);
      resetSteps();
    } catch {}
  };

  const handleGoalsSubmit = async (data: GoalsForm) => {
    try {
      await updateGoals({
        steps_goal: data.stepsGoal,
        calories_goal: data.caloriesGoal,
        workout_minutes_goal: data.workoutGoal,
        water_ml_goal: data.waterGoal,
        weight_goal: data.weightGoal
      });
    } catch {}
  };

  // Aggregated totals for today
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySteps = stepLogs.find(l => l.date === todayStr)?.steps || 0;
  const todayWorkoutMin = workoutLogs.filter((l: any) => l.date === todayStr).reduce((sum: number, w: any) => sum + w.duration_minutes, 0);
  
  // Calorie calculations
  const workoutBurned = workoutLogs.filter((l: any) => l.date === todayStr).reduce((sum: number, w: any) => sum + w.calories_burned, 0);
  const stepsBurned = stepLogs.find(l => l.date === todayStr)?.calories_burned || 0;
  const todayBurned = workoutBurned + Number(stepsBurned);

  // Goal target configs
  const stepsTarget = goals?.steps_goal || 10000;
  const caloriesTarget = goals?.calories_goal || 600;
  const workoutTarget = goals?.workout_minutes_goal || 30;

  // Chart Mappers
  const stepsChartData = stepLogs.slice(0, 7).reverse().map(l => ({
    name: new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: l.steps
  }));

  const workoutChartData = workoutLogs.slice(0, 7).reverse().map((l: any) => ({
    name: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: l.calories_burned
  }));

  const waterChartData = waterLogs.slice(0, 7).reverse().map(l => ({
    name: new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: l.amount_ml
  }));

  const weightChartData = weightLogs.slice(0, 7).reverse().map(l => ({
    name: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Number(l.weight_kg)
  }));

  // Log table item converters
  const stepsTableItems = stepLogs.map(l => ({
    id: l.id,
    title: `${l.steps.toLocaleString()} Steps`,
    subtitle: 'Daily walking steps tracker',
    value: `${l.steps.toLocaleString()} steps`,
    date: l.date,
    badgeText: `-${l.calories_burned} kcal`,
    badgeVariant: 'primary' as const
  }));

  const waterTableItems = waterLogs.map(l => ({
    id: l.id,
    title: 'Hydration Intake',
    subtitle: 'Pure water log',
    value: `${(l.amount_ml / 1000).toFixed(2)} L`,
    date: l.date,
    badgeText: `${l.amount_ml} ml`,
    badgeVariant: 'success' as const
  }));

  const workoutTableItems = workoutLogs.map((l: any) => ({
    id: l.id,
    title: l.name,
    subtitle: `Intensity: ${l.intensity} | Category: ${l.category}`,
    value: `${l.duration_minutes} mins`,
    date: l.date,
    notes: l.notes,
    badgeText: `-${l.calories_burned} kcal`,
    badgeVariant: 'warning' as const
  }));

  const weightTableItems = weightLogs.map(l => ({
    id: l.id,
    title: `${l.weight_kg} kg`,
    subtitle: `Calculated BMI: ${l.bmi}`,
    value: `${l.weight_kg} kg`,
    date: l.date,
    badgeText: `BMI: ${l.bmi}`,
    badgeVariant: 'danger' as const
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* 1. Header and quick actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Fitness Tracker
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Log active biometrics, view history charts, and synchronize your goals.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowStepsModal(true)} variant="secondary" leftIcon="directions_walk" size="sm">
            Log Steps
          </Button>
          <Button onClick={() => setShowWeightModal(true)} variant="outline" leftIcon="scale" size="sm">
            Log Weight
          </Button>
          <Button onClick={() => setShowWorkoutModal(true)} leftIcon="add" size="sm">
            Log Workout
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Progress summaries cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FitnessCard
          title="Steps Today"
          value={todaySteps.toLocaleString()}
          goalValue={stepsTarget.toLocaleString()}
          percentage={Math.round((todaySteps / stepsTarget) * 100)}
          icon="directions_walk"
          colorTheme="green"
        />

        <FitnessCard
          title="Hydration"
          value={`${(todayWater / 1000).toFixed(2)} L`}
          goalValue={`${(waterGoal / 1000).toFixed(1)} L`}
          percentage={Math.round((todayWater / waterGoal) * 100)}
          icon="local_drinking_water"
          colorTheme="cyan"
        />

        <FitnessCard
          title="Active minutes"
          value={`${todayWorkoutMin} mins`}
          goalValue={`${workoutTarget} mins`}
          percentage={Math.round((todayWorkoutMin / workoutTarget) * 100)}
          icon="fitness_center"
          colorTheme="violet"
        />

        <FitnessCard
          title="Calories Burned"
          value={`${todayBurned} kcal`}
          goalValue={`${caloriesTarget} kcal`}
          percentage={Math.round((todayBurned / caloriesTarget) * 100)}
          icon="local_fire_department"
          colorTheme="orange"
        />
      </div>

      {/* 3. Category Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {(['workouts', 'steps', 'water', 'weight', 'goals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab 
                ? 'border-brand-650 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Tab Panels */}
      {activeTab === 'goals' ? (
        <div className="max-w-2xl mx-auto text-left">
          <Card variant="glass" className="p-6">
            <h3 className="text-sm font-black text-slate-950 dark:text-white mb-2">Configure Fitness Targets</h3>
            <p className="text-[10px] text-slate-400 font-semibold mb-6">Updates populate progress gauges instantly.</p>
            
            <form onSubmit={handleSubmitGoals(handleGoalsSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Daily Steps Goal"
                  type="number"
                  placeholder="10000"
                  {...registerGoals('stepsGoal')}
                />
                
                <Input
                  label="Daily Calorie Goal (kcal)"
                  type="number"
                  placeholder="2500"
                  {...registerGoals('caloriesGoal')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Workout Goal (minutes)"
                  type="number"
                  placeholder="30"
                  {...registerGoals('workoutGoal')}
                />

                <Input
                  label="Daily Water Goal (ml)"
                  type="number"
                  placeholder="2500"
                  {...registerGoals('waterGoal')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target Weight Goal (kg)"
                  type="number"
                  placeholder="70"
                  {...registerGoals('weightGoal')}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={goalsLoading} leftIcon="save">
                  Save Goals
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2">
            {activeTab === 'workouts' && (
              <StatisticsChart
                title="Workout Burn"
                data={workoutChartData}
                type="bar"
                color="#8b5cf6"
                gradientId="workGrad"
                unit="kcal"
                emptyMessage="No workouts logged recently."
              />
            )}
            {activeTab === 'steps' && (
              <StatisticsChart
                title="Steps Trend"
                data={stepsChartData}
                type="bar"
                color="#10b981"
                gradientId="stepsGrad"
                unit="steps"
                emptyMessage="No steps logged. Manual log to chart trends!"
              />
            )}
            {activeTab === 'water' && (
              <StatisticsChart
                title="Hydration Intake"
                data={waterChartData}
                type="area"
                color="#06b6d4"
                gradientId="waterGrad"
                unit="ml"
                emptyMessage="No hydration entries logged."
              />
            )}
            {activeTab === 'weight' && (
              <div className="space-y-6">
                <StatisticsChart
                  title="Weight Readings"
                  data={weightChartData}
                  type="line"
                  color="#3b82f6"
                  gradientId="weightGrad"
                  unit="kg"
                  emptyMessage="No weight history recorded."
                />
                
                {/* BMI Info overlay */}
                <Card variant="glass" className="p-5 text-left flex gap-4 items-center">
                  <div className={`p-4 rounded-2xl font-black text-xl text-center ${bmiCategory.bg} ${bmiCategory.color}`}>
                    {latestBmi}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">BMI status:</h4>
                      <span className={`text-xs font-black ${bmiCategory.color}`}>{bmiCategory.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      {bmiSuggestion} Healthy BMI range is 18.5 - 24.9.
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Logs lists and quick log helper buttons */}
          <Card variant="glass" className="p-6 flex flex-col justify-between h-fit">
            <div>
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white capitalize">{activeTab} Logs History</h3>
                {activeTab === 'water' && (
                  <span className="text-[9px] font-black text-cyan-500 uppercase">Quick Hydro</span>
                )}
              </div>

              {/* Water quick action buttons */}
              {activeTab === 'water' && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[250, 500, 750, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => logWater(amount)}
                      disabled={waterLoading}
                      className="py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-550/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-black border border-cyan-500/25 cursor-pointer transition-colors"
                    >
                      +{amount >= 1000 ? '1L' : `${amount}ml`}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {activeTab === 'workouts' && (
                  <HistoryTable
                    items={workoutTableItems}
                    onDelete={deleteWorkoutLog}
                    loading={workoutLoading}
                    emptyText="No workouts logged recently."
                  />
                )}
                {activeTab === 'steps' && (
                  <HistoryTable
                    items={stepsTableItems}
                    onDelete={deleteStepLog}
                    loading={stepLoading}
                    emptyText="No steps logs found."
                  />
                )}
                {activeTab === 'water' && (
                  <HistoryTable
                    items={waterTableItems}
                    onDelete={deleteWaterLog}
                    loading={waterLoading}
                    emptyText="No water entries logged."
                  />
                )}
                {activeTab === 'weight' && (
                  <div className="space-y-4">
                    {weightChange !== 0 && (
                      <div className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-bold ${weightChange > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <span className="material-symbols-outlined text-[1.25em]">{weightChange > 0 ? 'trending_up' : 'trending_down'}</span>
                        <span>Weight Change: {weightChange > 0 ? `+${weightChange}` : weightChange} kg total</span>
                      </div>
                    )}
                    <HistoryTable
                      items={weightTableItems}
                      onDelete={deleteWeightLog}
                      loading={weightLoading}
                      emptyText="No weights logged."
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 5. Modals forms */}
      {/* Log steps */}
      <Modal isOpen={showStepsModal} onClose={() => setShowStepsModal(false)} title="Log Walking Steps">
        <form onSubmit={handleSubmitSteps(handleStepsSubmit)} className="space-y-4 text-left">
          <Input
            label="Steps Count"
            type="number"
            placeholder="8500"
            {...registerSteps('manualSteps', { required: true })}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowStepsModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={stepLoading}>Save Steps</Button>
          </div>
        </form>
      </Modal>

      {/* Log weight */}
      <Modal isOpen={showWeightModal} onClose={() => setShowWeightModal(false)} title="Log Scale Weight">
        <form onSubmit={handleSubmitWeight(handleWeightSubmit)} className="space-y-4 text-left">
          <Input
            label="Weight (kg)"
            type="number"
            placeholder="72.5"
            error={wtErrors.weightKg?.message}
            {...registerWeight('weightKg')}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowWeightModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={weightLoading}>Save Weight</Button>
          </div>
        </form>
      </Modal>

      {/* Log workout */}
      <Modal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} title="Log Workout Session">
        <form onSubmit={handleSubmitWorkout(handleWorkoutSubmit)} className="space-y-4 text-left">
          <Input
            label="Workout Title / Name"
            placeholder="Evening Jog, Core routine"
            error={wErrors.workoutName?.message}
            {...registerWorkout('workoutName')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Workout Category"
              as="select"
              options={[
                { value: 'cardio', label: 'Cardio Workout' },
                { value: 'strength', label: 'Strength Workout' },
                { value: 'yoga', label: 'Yoga & Flexibility' },
                { value: 'hiit', label: 'HIIT Cardio Blast' },
                { value: 'gym', label: 'Gym Lift Plan' }
              ]}
              error={wErrors.category?.message}
              {...registerWorkout('category')}
            />

            <Input
              label="Intensity level"
              as="select"
              options={[
                { value: 'low', label: 'Low intensity' },
                { value: 'medium', label: 'Medium intensity' },
                { value: 'high', label: 'High intensity' }
              ]}
              error={wErrors.intensity?.message}
              {...registerWorkout('intensity')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              placeholder="30"
              error={wErrors.duration?.message}
              {...registerWorkout('duration')}
            />

            <Input
              label="Estimated Calories Spent (kcal)"
              type="number"
              placeholder="250"
              error={wErrors.calories?.message}
              {...registerWorkout('calories')}
            />
          </div>

          <Input
            label="Workout Notes (Optional)"
            as="textarea"
            placeholder="Feeling fresh, tracked using smart watch..."
            error={wErrors.notes?.message}
            {...registerWorkout('notes')}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowWorkoutModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={workoutLoading}>Save Workout</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FitnessTracker;
