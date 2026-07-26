// FitSync Component: ObservabilityPanel
// Admin panel displaying system health status, active logs, and latency metrics charts

import React from 'react';
import Card from '../ui/Card';
import { useMonitoring } from '../../hooks/useMonitoring';
import { useLogs } from '../../hooks/useLogs';
import { useMetrics } from '../../hooks/useMetrics';

export const ObservabilityPanel: React.FC = () => {
  const { health, errorsCount, refetch: refetchHealth } = useMonitoring();
  const { logs, refetch: refetchLogs } = useLogs();
  const { metrics, refetch: refetchMetrics } = useMetrics();

  const handleRefreshAll = () => {
    refetchHealth();
    refetchLogs();
    refetchMetrics();
  };

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Card variant="glass" className="p-4 border border-slate-100 dark:border-slate-800/40 rounded-3xl">
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined p-2 rounded-2xl text-xl ${health?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              sensors
            </span>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black text-slate-400">System Availability</span>
              <h4 className="text-xs font-black capitalize dark:text-white">{health?.status || 'Online'}</h4>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border border-slate-100 dark:border-slate-800/40 rounded-3xl">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined p-2 rounded-2xl text-xl bg-brand-500/10 text-brand-500">
              speed
            </span>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black text-slate-400">Latency Benchmark</span>
              <h4 className="text-xs font-black dark:text-white">{health?.latencyMs || 12} ms</h4>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border border-slate-100 dark:border-slate-800/40 rounded-3xl">
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined p-2 rounded-2xl text-xl ${errorsCount > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              bug_report
            </span>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black text-slate-400">Errors Trapped (24h)</span>
              <h4 className="text-xs font-black dark:text-white">{errorsCount} Issues</h4>
            </div>
          </div>
        </Card>

      </div>

      {/* Structured Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Core Web Vitals Panel */}
        <Card variant="glass" className="p-5 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/30">
            <h4 className="text-xs font-black dark:text-white uppercase tracking-wider">Web Vitals Telemetry</h4>
            <button onClick={handleRefreshAll} className="material-symbols-outlined text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm">
              refresh
            </button>
          </div>
          
          <div className="space-y-3">
            {metrics.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-semibold">No metrics logs received yet.</p>
            ) : (
              metrics.slice(0, 5).map((m) => (
                <div key={m.id} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize">{m.metric_name}</span>
                  <span className="font-black text-slate-900 dark:text-white">{m.value.toFixed(1)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Live Logs Stream */}
        <Card variant="glass" className="p-5 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/30">
            <h4 className="text-xs font-black dark:text-white uppercase tracking-wider">Live System Logs</h4>
            <button onClick={handleRefreshAll} className="material-symbols-outlined text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm">
              refresh
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-semibold">No system logs registered.</p>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="text-[10px] flex items-start gap-2 border-b border-slate-50 dark:border-slate-800/20 pb-1.5">
                  <span className={`px-1.5 py-0.5 rounded font-black uppercase text-[8px] ${l.level === 'error' || l.level === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {l.level}
                  </span>
                  <span className="font-semibold text-slate-500">[{l.component}]</span>
                  <span className="font-medium text-slate-800 dark:text-slate-255 flex-1">{l.message}</span>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default ObservabilityPanel;
