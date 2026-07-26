// FitSync Component: WorkoutGenerator
// Form container collecting fitness parameters and rendering generated workout plans in markdown formats

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { WorkoutGenerationSpecs } from '../../services/ai/workoutAIService';

interface WorkoutGeneratorProps {
  onGenerate: (specs: WorkoutGenerationSpecs) => Promise<any>;
  result: string | null;
  loading?: boolean;
  onClear: () => void;
}

export const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({
  onGenerate,
  result,
  loading = false,
  onClear
}) => {
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [fitnessGoal, setFitnessGoal] = useState('Gain Muscle');
  const [activityLevel, setActivityLevel] = useState('Moderate');
  const [equipment, setEquipment] = useState('Dumbbells Only');
  const [duration, setDuration] = useState(45);
  const [experience, setExperience] = useState('Intermediate');
  const [injuries, setInjuries] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      age,
      gender,
      weight,
      height,
      fitnessGoal,
      activityLevel,
      equipment,
      duration,
      experience,
      injuries: injuries || 'none'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left select-none">
      
      {/* Parameter Form */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl h-fit">
        <h3 className="text-sm font-black text-slate-855 dark:text-white mb-4">Generate Routine</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              required
            />
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              required
            />
            <Input
              label="Height (cm)"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Gain Muscle">Gain Muscle</option>
                <option value="Stamina & Cardio">Stamina & Cardio</option>
                <option value="Mobility & Yoga">Mobility & Yoga</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="Sedentary">Sedentary</option>
                <option value="Moderate">Moderate</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Equipment</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="No Equipment (Bodyweight)">No Equipment (Bodyweight)</option>
                <option value="Dumbbells Only">Dumbbells Only</option>
                <option value="Full Gym Access">Full Gym Access</option>
                <option value="Resistance Bands">Resistance Bands</option>
              </select>
            </div>

            <Input
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Experience</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <Input
              label="Injuries / Limitations"
              placeholder="e.g. Bad knee, Lower back pain"
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={loading} disabled={loading} leftIcon="psychology">
            Compile Workout Plan
          </Button>
        </form>
      </Card>

      {/* Result Panel */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl min-h-60 relative flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center select-none border-b border-slate-100 dark:border-slate-800/30 pb-2 mb-3">
            <h3 className="text-sm font-black text-slate-855 dark:text-white">AI Recommendations</h3>
            {result && (
              <button onClick={onClear} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3 py-10">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-2/3" />
            </div>
          ) : result ? (
            <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed scrollbar-thin max-h-[50vh] overflow-y-auto pr-1">
              {result}
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-20 text-center font-semibold">Configure details on the left and tap compile.</p>
          )}
        </div>
      </Card>

    </div>
  );
};

export default WorkoutGenerator;
