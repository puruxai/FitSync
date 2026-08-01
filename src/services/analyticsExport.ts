// FitSync Analytics Export Service
// Generates tabular CSV / JSON report logs and compiles PDF files using jsPDF

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getFromMockDb, saveToMockDb } from './mockDb';
import { jsPDF } from 'jspdf';

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
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      
      // Page Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(57, 255, 20); // Neon green header accent
      doc.text('FITSYNC ATHLETE ANALYTICS', 15, 22);

      // Metadata block
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 28);
      doc.text(`Profile ID: ${userId}`, 15, 33);
      doc.text(`Document: ${reportName}`, 15, 38);

      // Dividing Line
      doc.setDrawColor(57, 255, 20);
      doc.setLineWidth(0.5);
      doc.line(15, 42, 195, 42);

      // Draw table header container
      doc.setFillColor(20, 20, 20);
      doc.rect(15, 48, 180, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(57, 255, 20);
      doc.text('FITNESS METRICS DESCRIPTION', 20, 53);
      doc.text('VALUE', 155, 53);

      // Draw table body rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);

      let currentY = 64;
      data.forEach((row, index) => {
        const metricName = row.Metric || row.metric || '';
        const valueText = row.Value || row.value || '';

        // Row background shading
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(15, currentY - 5, 180, 8, 'F');
        }
        
        doc.text(String(metricName), 20, currentY);
        doc.text(String(valueText), 155, currentY);
        currentY += 8;
      });

      doc.save(`${reportName.toLowerCase().replace(/ /g, '_')}.pdf`);
    } else {
      // Excel fallback: download json formatted details
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
