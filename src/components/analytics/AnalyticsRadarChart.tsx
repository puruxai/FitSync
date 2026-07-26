// FitSync Component: AnalyticsRadarChart
// Renders subscores distribution in a Recharts Radar diagram (Steps, Water, Workouts, Consistency)

import React from 'react';
import Card from '../ui/Card';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

interface AnalyticsRadarChartProps {
  steps: number;
  water: number;
  workout: number;
  calories: number;
  consistency: number;
}

export const AnalyticsRadarChart: React.FC<AnalyticsRadarChartProps> = ({
  steps,
  water,
  workout,
  calories,
  consistency
}) => {
  const data = [
    { subject: 'Steps', A: steps, fullMark: 100 },
    { subject: 'Hydration', A: water, fullMark: 100 },
    { subject: 'Workouts', A: workout, fullMark: 100 },
    { subject: 'Calories', A: calories, fullMark: 100 },
    { subject: 'Consistency', A: consistency, fullMark: 100 }
  ];

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-4">
      <div>
        <h4 className="text-[10px] font-black uppercase text-slate-400">Subscores Breakdown</h4>
        <span className="text-[8px] text-slate-400 block font-bold">Radar map of fitness components</span>
      </div>

      <div className="h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
            <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AnalyticsRadarChart;
