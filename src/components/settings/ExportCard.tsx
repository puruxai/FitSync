// FitSync Component: ExportCard
// Renders options to download aggregated profile, fitness statistics, and challenge completion files

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface ExportCardProps {
  onExport: (format: 'json' | 'csv') => Promise<void>;
  loading?: boolean;
}

export const ExportCard: React.FC<ExportCardProps> = ({
  onExport,
  loading = false
}) => {
  const [exporting, setExporting] = React.useState<'json' | 'csv' | null>(null);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(format);
      await onExport(format);
      toast.success(`Data exported in ${format.toUpperCase()} format successfully!`, { icon: '💾' });
    } catch {
      toast.error('Failed to compile data export.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-855 dark:text-white leading-tight">
          Export Personal Data
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold mt-1">
          Download a complete copy of your biometrics, fitness logs, and challenge histories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/20 rounded-2xl flex flex-col justify-between h-36">
          <div>
            <h4 className="text-xs font-bold text-slate-855 dark:text-white leading-none">JSON Format</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-2 leading-relaxed">
              Best for importing into other applications or programmatic analysis. Includes full structured logs schema.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => handleExport('json')}
            disabled={exporting !== null || loading}
            isLoading={exporting === 'json'}
            leftIcon="download"
          >
            Download JSON
          </Button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/20 rounded-2xl flex flex-col justify-between h-36">
          <div>
            <h4 className="text-xs font-bold text-slate-855 dark:text-white leading-none">CSV Spreadsheet</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-2 leading-relaxed">
              Best for reading in Microsoft Excel, Google Sheets, or Numbers. Includes step logs and water intakes.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null || loading}
            isLoading={exporting === 'csv'}
            leftIcon="table_chart"
          >
            Download CSV
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ExportCard;
