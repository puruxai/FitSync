// FitSync Component: ExportReportDialog
// Modal dialog allowing users to enter custom report titles and choose PDF/CSV formats

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ExportReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (name: string, format: 'pdf' | 'csv' | 'excel') => Promise<void>;
  loading?: boolean;
}

export const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  loading = false
}) => {
  const [reportName, setReportName] = useState('My Fitness Projections');

  const handleTrigger = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!reportName.trim()) return;
    await onExport(reportName, format);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Business Intelligence Report"
    >
      <div className="space-y-5 text-left select-none">
        <Input
          label="Report Name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          required
        />

        <div className="grid grid-cols-3 gap-3 pt-3">
          <Button
            size="sm"
            onClick={() => handleTrigger('csv')}
            disabled={loading}
            leftIcon="table_chart"
          >
            CSV Format
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTrigger('pdf')}
            disabled={loading}
            leftIcon="picture_as_pdf"
          >
            PDF Format
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTrigger('excel')}
            disabled={loading}
            leftIcon="grid_on"
          >
            Excel Format
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportReportDialog;
