// FitSync Component: DietGenerator
// Form container collecting nutrition preferences and displaying custom diet logs

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { DietGenerationSpecs } from '../../services/ai/dietAIService';

interface DietGeneratorProps {
  onGenerate: (specs: DietGenerationSpecs) => Promise<any>;
  result: string | null;
  loading?: boolean;
  onClear: () => void;
}

export const DietGenerator: React.FC<DietGeneratorProps> = ({
  onGenerate,
  result,
  loading = false,
  onClear
}) => {
  const [dietGoal, setDietGoal] = useState<'loss' | 'gain' | 'maintenance'>('loss');
  const [preferences, setPreferences] = useState<'none' | 'vegetarian' | 'vegan' | 'high_protein' | 'low_carb' | 'balanced'>('balanced');
  const [mealsStyle, setMealsStyle] = useState<'indian' | 'international'>('international');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      dietGoal,
      preferences,
      mealsStyle,
      weight,
      height,
      age
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left select-none">
      
      {/* Diet Parameter Form */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl h-fit">
        <h3 className="text-sm font-black text-slate-855 dark:text-white mb-4">Generate Nutrition Meal Plan</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dietary Goal</label>
              <select
                value={dietGoal}
                onChange={(e) => setDietGoal(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="loss">Weight Loss</option>
                <option value="gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Culinary Preference</label>
              <select
                value={preferences}
                onChange={(e) => setPreferences(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="none">Standard Diet</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="high_protein">High Protein</option>
                <option value="low_carb">Low Carb</option>
                <option value="balanced">Balanced Macro Ratio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meals Culinary Style</label>
              <select
                value={mealsStyle}
                onChange={(e) => setMealsStyle(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="indian">Indian Meals & Spices</option>
                <option value="international">Continental / International</option>
              </select>
            </div>

            <Input
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              required
            />
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

          <Button type="submit" className="w-full" isLoading={loading} disabled={loading} leftIcon="restaurant_menu">
            Compile Meal Plan
          </Button>
        </form>
      </Card>

      {/* Diet Result Panel */}
      <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl min-h-60 relative flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center select-none border-b border-slate-100 dark:border-slate-800/30 pb-2 mb-3">
            <h3 className="text-sm font-black text-slate-855 dark:text-white">AI Diet Plan Summary</h3>
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
            <p className="text-slate-400 text-xs py-20 text-center font-semibold">Configure choices on the left and tap compile.</p>
          )}
        </div>
      </Card>

    </div>
  );
};

export default DietGenerator;
