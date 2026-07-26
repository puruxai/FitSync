// FitSync Component: ErrorBoundary
// Catches javascript rendering exceptions in components and displays fallback retry screens

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorTrackingService } from '../../services/recovery/errorTracking';
import Card from './Card';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Error Boundary] Trapped Exception:', error, errorInfo);
    ErrorTrackingService.reportCrash(error.message, errorInfo.componentStack || '');
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center select-none">
          <Card variant="glass" className="max-w-md w-full p-8 border border-red-500/20 rounded-3xl space-y-6">
            <span className="material-symbols-outlined text-6xl text-red-500 bg-red-500/10 p-4 rounded-3xl animate-pulse">
              running_with_errors
            </span>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Something Went Wrong</h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                FitSync encountered a layout rendering error. We have logged the issue for analysis.
              </p>
              {this.state.errorMessage && (
                <pre className="text-[10px] bg-slate-100 dark:bg-slate-900 text-red-500 p-3 rounded-2xl overflow-x-auto text-left max-h-24">
                  {this.state.errorMessage}
                </pre>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReload} leftIcon="refresh">
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
