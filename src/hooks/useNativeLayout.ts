// FitSync Hook: useNativeLayout
// Adds custom safe-area offsets if running inside Capacitor Android sandboxes

import { useState, useEffect } from 'react';

export const useNativeLayout = () => {
  const [isNativeShell, setIsNativeShell] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      setIsNativeShell(true);
      document.body.classList.add('capacitor-native-shell');
    }
  }, []);

  return {
    isNativeShell
  };
};

export default useNativeLayout;
