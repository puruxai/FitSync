// FitSync Component: PerformanceGraph
// Plots user rank history trends using pure responsive inline SVG elements

import React from 'react';
import Card from '../ui/Card';
import type { UserRankHistory } from '../../services/ranking';

interface PerformanceGraphProps {
  history: UserRankHistory[];
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <Card variant="glass" className="h-64 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/40 rounded-3xl">
        <p className="text-slate-400 text-xs font-semibold">No rank history logs recorded yet.</p>
      </Card>
    );
  }

  // Dimensions
  const width = 500;
  const height = 200;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Extract ranks and dates
  const ranks = history.map(h => h.rank);
  const minRank = Math.max(1, Math.min(...ranks) - 1);
  const maxRank = Math.max(...ranks) + 1;
  const rankRange = maxRank - minRank || 1;

  // Compute points coordinates
  // Y axis is inverted: rank 1 is highest (at Y=padding), rank 10 is lowest (at Y=height-padding)
  const points = history.map((item, idx) => {
    const x = padding + (idx / (history.length - 1 || 1)) * chartWidth;
    const y = padding + ((item.rank - minRank) / rankRange) * chartHeight;
    return { x, y, label: item.recorded_at, rank: item.rank };
  });

  // Construct SVG path string
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left">
      <h3 className="text-sm font-black text-slate-850 dark:text-white leading-tight mb-4">
        Rank History Performance Timeline
      </h3>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3,3" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3,3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3,3" />

          {/* Area fill under path */}
          {points.length > 0 && (
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
              fill="url(#grad)"
              className="opacity-40"
            />
          )}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#line-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-white stroke-brand-500 dark:stroke-brand-400"
                strokeWidth="2.5"
              />
              {/* Tooltip labels */}
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                className="text-[9px] font-black fill-slate-700 dark:fill-slate-300"
              >
                #{pt.rank}
              </text>
              {/* Date label at bottom */}
              <text
                x={pt.x}
                y={height - padding + 15}
                textAnchor="middle"
                className="text-[7px] font-bold fill-slate-400 dark:fill-slate-500"
              >
                {pt.label.split('-')[2]}/{pt.label.split('-')[1]}
              </text>
            </g>
          ))}

          {/* Gradients declarations */}
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </Card>
  );
};

export default PerformanceGraph;
