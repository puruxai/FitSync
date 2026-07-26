// FitSync Hook: useReports
// Handles querying moderation flags lists and updating resolved statuses

import { useState, useEffect, useCallback } from 'react';
import { ReportService, type ModerationReport } from '../services/report';

export const useReports = (active = false) => {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!active) return;
    try {
      setLoading(true);
      const data = await ReportService.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const resolveReport = async (reportId: string, status: 'resolved_approved' | 'resolved_rejected') => {
    await ReportService.resolveReport(reportId, status);
    setReports(prev => 
      prev.map(r => r.id === reportId ? { ...r, status } : r)
    );
  };

  const submitReport = async (reportedUserId: string, category: ModerationReport['category'], reason: string, reporterId: string) => {
    await ReportService.submitReport(reporterId, reportedUserId, category, reason);
    await fetchReports();
  };

  return {
    reports,
    loading,
    resolveReport,
    submitReport,
    refetch: fetchReports
  };
};

export default useReports;
