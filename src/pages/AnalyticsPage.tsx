// FitSync Page: AnalyticsPage
// Implements advanced Business Intelligence: Fitness Scores gauges, Recharts Radar breakdowns, and BI reports downloads

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFitnessAnalytics } from '../hooks/useFitnessAnalytics';
import { useStatistics } from '../hooks/useStatistics';
import { useAnalyticsReports } from '../hooks/useAnalyticsReports';
import FitnessScoreDial from '../components/analytics/FitnessScoreDial';
import AnalyticsRadarChart from '../components/analytics/AnalyticsRadarChart';
import AnalyticsLineChart from '../components/analytics/AnalyticsLineChart';
import InsightsGrid from '../components/analytics/InsightsGrid';
import ExportReportDialog from '../components/analytics/ExportReportDialog';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

export const AnalyticsPage: React.FC = () => {
  const { profile } = useAuth();
  const [showExportModal, setShowExportModal] = useState(false);

  // Load custom hooks
  const { scoreData, scoreHistory, loading: scoreLoading } = useFitnessAnalytics(profile?.id);
  const { stats, loading: statsLoading } = useStatistics(profile?.id);
  const { exportAnalyticsReport, exporting } = useAnalyticsReports(profile?.id);

  const handleExport = async (name: string, format: 'pdf' | 'csv' | 'excel') => {
    if (!scoreData || !stats) return;

    // Aggregate report dataset
    const reportData = [
      { Metric: 'Overall Fitness Score', Value: scoreData.score },
      { Metric: 'Steps Component Score', Value: scoreData.stepsScore },
      { Metric: 'Workout Duration Score', Value: scoreData.workoutScore },
      { Metric: 'Calories Component Score', Value: scoreData.caloriesScore },
      { Metric: 'Hydration Component Score', Value: scoreData.waterScore },
      { Metric: 'Consistency Index', Value: scoreData.consistencyScore },
      { Metric: 'Average Daily Steps', Value: stats.average_steps },
      { Metric: 'Average Workout Minutes', Value: stats.average_workout_duration }
    ];

    await exportAnalyticsReport(name, format, reportData);
  };

  if (!profile) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* Title Header */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Fitness Analytics
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Evaluate your calculated fitness scores, subscores radars, and compile details logs exports.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowExportModal(true)} leftIcon="ios_share">
          Export Report
        </Button>
      </div>

      {scoreLoading || statsLoading || !scoreData || !stats ? (
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Key metrics stats */}
          <InsightsGrid stats={stats} />

          {/* Dials and Radar breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Fitness score PROGRESS Dial */}
            <div className="lg:col-span-1">
              <FitnessScoreDial score={scoreData.score} />
            </div>

            {/* Radar subscores map */}
            <div className="lg:col-span-1">
              <AnalyticsRadarChart
                steps={scoreData.stepsScore}
                water={scoreData.waterScore}
                workout={scoreData.workoutScore}
                calories={scoreData.caloriesScore}
                consistency={scoreData.consistencyScore}
              />
            </div>

            {/* Historical Score area chart */}
            <div className="lg:col-span-1">
              <AnalyticsLineChart history={scoreHistory} />
            </div>

          </div>

        </div>
      )}

      {/* Export modal dialog */}
      {showExportModal && (
        <ExportReportDialog
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          loading={exporting}
        />
      )}

    </div>
  );
};

export default AnalyticsPage;
