// FitSync Component: AIDashboard
// Displays calculated health scores, prediction widgets, and strength/weakness evaluations

import React from 'react';
import Card from '../ui/Card';
import type { AIInsight } from '../../services/ai/insightService';
import type { AIPrediction } from '../../services/ai/predictionService';

interface AIDashboardProps {
  insights: AIInsight[];
  predictions: AIPrediction[];
  loading?: boolean;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({
  insights,
  predictions,
  loading = false
}) => {
  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Overview dials and Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-slate-400">AI Health Score</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">84</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">Optimal Condition</p>
          </div>

          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="6" fill="transparent" />
              <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-brand-500" strokeWidth="6" fill="transparent" strokeDasharray="163" strokeDashoffset="26" />
            </svg>
            <span className="material-symbols-outlined absolute text-brand-500 text-[1.4em]">favorite</span>
          </div>
        </Card>

        <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-slate-400">Calorie Adherence</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">92%</span>
            </div>
            <p className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">Excellent Focus</p>
          </div>
          <span className="material-symbols-outlined text-4xl text-orange-500 p-2 bg-orange-500/10 rounded-2xl">local_fire_department</span>
        </Card>

        <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-slate-400">Consistency Index</h4>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">88%</span>
            </div>
            <p className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full w-fit">Steady Routine</p>
          </div>
          <span className="material-symbols-outlined text-4xl text-indigo-500 p-2 bg-indigo-500/10 rounded-2xl">bolt</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column - Progress Predictions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">AI Progress Predictions</h3>
          
          {loading ? (
            <div className="h-60 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
          ) : (
            <div className="space-y-3">
              {predictions.map(p => (
                <Card 
                  key={p.id} 
                  className="p-4 border border-slate-200/40 dark:border-slate-800/20 bg-white/20 dark:bg-slate-850/30 flex justify-between items-center"
                  variant="glass"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-450">{p.metric_type}</span>
                    <h5 className="text-[11px] font-black text-slate-855 dark:text-white mt-1 leading-snug">
                      {p.predicted_value}
                    </h5>
                  </div>

                  <div className="pl-4 text-right">
                    <span className="text-[8px] text-slate-400 block font-bold">Confidence</span>
                    <span className="text-xs font-black text-brand-650 dark:text-brand-400 block mt-0.5">{p.probability}%</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Evaluative Insights */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Evaluative AI Insights</h3>

          {loading ? (
            <div className="h-60 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
          ) : (
            <div className="space-y-4">
              {insights.map(i => (
                <Card key={i.id} variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-brand-500">{i.category}</span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-250 font-bold leading-relaxed">
                    {i.insight}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/30">
                    {i.strength_analysis && (
                      <div>
                        <span className="text-[8px] font-black uppercase text-emerald-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[1.25em]">thumb_up</span> Core Strength
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                          {i.strength_analysis}
                        </p>
                      </div>
                    )}

                    {i.weakness_analysis && (
                      <div>
                        <span className="text-[8px] font-black uppercase text-red-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[1.25em]">warning</span> Vulnerability Alert
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                          {i.weakness_analysis}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AIDashboard;
