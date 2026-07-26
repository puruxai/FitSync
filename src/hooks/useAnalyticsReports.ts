// FitSync Hook: useAnalyticsReports
// Manages exporting daily metrics summaries and workout trends logs into CSV/PDF files

import { useState } from 'react';
import { AnalyticsExportService } from '../services/analyticsExport';
import { AnalyticsService } from '../services/analytics';

export const useAnalyticsReports = (userId?: string) => {
  const [exporting, setExporting] = useState(false);

  const exportAnalyticsReport = async (
    reportName: string,
    format: 'pdf' | 'csv' | 'excel',
    data: any[]
  ) => {
    if (!userId) return;
    try {
      setExporting(true);
      await AnalyticsExportService.exportReport(userId, reportName, format, data);
      
      // Log event
      await AnalyticsService.logEvent(userId, `export_report_${format}`, { reportName });
    } catch (err) {
      console.error('Failed to export analytics report:', err);
      throw err;
    } finally {
      setExporting(false);
    }
  };

  return {
    exportAnalyticsReport,
    exporting
  };
};

export default useAnalyticsReports;
