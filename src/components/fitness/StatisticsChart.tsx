// FitSync Component: StatisticsChart
// Renders Recharts bar or line trends for workouts, steps, weight, and water metrics across customizable timeframes

import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, AreaChart, Area
} from 'recharts';
import Card from '../ui/Card';

interface ChartDataItem {
  name: string;
  value: number;
}

interface StatisticsChartProps {
  title: string;
  data: ChartDataItem[];
  type: 'bar' | 'line' | 'area';
  color?: string;
  gradientId?: string;
  unit?: string;
  emptyMessage?: string;
}

export const StatisticsChart: React.FC<StatisticsChartProps> = ({
  title,
  data,
  type,
  color = '#3b82f6',
  gradientId = 'chart-gradient',
  unit = '',
  emptyMessage = 'No logs matching this period.'
}) => {
  const hasData = data && data.length > 0;

  return (
    <Card variant="glass" className="p-6 flex flex-col justify-between h-full">
      <div className="text-left mb-6">
        <h3 className="font-extrabold text-sm text-slate-950 dark:text-white capitalize">{title} Trend</h3>
        <p className="text-xs text-slate-400 font-semibold">Visualizing recorded targets over selected periods.</p>
      </div>

      <div className="h-80 w-full text-xs flex items-center justify-center">
        {!hasData ? (
          <div className="text-slate-400 font-semibold">{emptyMessage}</div>
        ) : type === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit={unit} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '16px', color: '#fff' }}
                formatter={(val) => [`${val} ${unit}`, 'Total']}
              />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : type === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit={unit} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '16px', color: '#fff' }}
                formatter={(val) => [`${val} ${unit}`, 'Intake']}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#${gradientId})`} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit={unit} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '16px', color: '#fff' }}
                formatter={(val) => [`${val} ${unit}`, 'Reading']}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default StatisticsChart;
