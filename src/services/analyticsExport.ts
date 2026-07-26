// FitSync Analytics Export Service
// Generates tabular CSV / JSON report logs and compiles file downloads

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';

export const AnalyticsExportService = {
  /**
   * Export fitness statistics report
   */
  async exportReport(
    userId: string,
    reportName: string,
    format: 'pdf' | 'csv' | 'excel',
    data: any[]
  ): Promise<void> {
    const payload = {
      user_id: userId,
      report_name: reportName,
      report_format: format
    };

    // Save export transaction log
    if (isSupabaseConfigured) {
      await supabase.from('analytics_reports').insert(payload);
    } else {
      const list = getFromMockDb<any>('analytics_reports');
      list.push({
        id: 'rep-' + Math.random().toString(36).substr(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      });
      saveToMockDb('analytics_reports', list);
    }

    // Trigger browser download
    if (format === 'csv') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      // Header row
      csvContent += Object.keys(data[0] || {}).join(',') + '\n';
      // Data rows
      data.forEach(row => {
        csvContent += Object.values(row).join(',') + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${reportName.toLowerCase().replace(/ /g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF or Excel format fallback: compile json formatted content
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName.toLowerCase().replace(/ /g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
};
export default AnalyticsExportService;
