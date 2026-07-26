// FitSync Component: AnalyticsLineChart
// Displays Fitness Score progress chart using Recharts Area charts

import React from 'react';
import Card from '../ui/Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface AnalyticsLineChartProps {
  history: any[];
}

export const AnalyticsLineChart: React.FC<AnalyticsLineChartProps> = ({ history }) => {
  const chartData = history.map(item => ({
    date: new Date(item.logged_date || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.fitness_score
  }));

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-4">
      <div>
        <h4 className="text-[10px] font-black uppercase text-slate-400">Fitness Score Projections</h4>
        <span className="text-[8px] text-slate-400 block font-bold">Progress trends over time</span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 700 }} />
            <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AnalyticsLineChart;
