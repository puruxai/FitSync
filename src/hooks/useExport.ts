// FitSync Hook: useExport
// Handles compiling profiles and workouts database entries into export format downloads

import { useState } from 'react';
import { ExportService } from '../services/export';
import { AccountService } from '../services/account';

export const useExport = (userId?: string) => {
  const [exporting, setExporting] = useState(false);

  const exportData = async (format: 'json' | 'csv') => {
    if (!userId) return;
    try {
      setExporting(true);
      await ExportService.exportUserData(userId, format);
      
      // Log audit
      await AccountService.logAction(userId, `data_export_${format}`);
    } catch (err) {
      console.error('Failed to export user data:', err);
      throw err;
    } finally {
      setExporting(false);
    }
  };

  return {
    exportData,
    exporting
  };
};

export default useExport;
