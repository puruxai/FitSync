import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';

// Pages - Dynamic Lazy Loading
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FitnessTracker = lazy(() => import('./pages/FitnessTracker'));
const Social = lazy(() => import('./pages/Social'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Challenges = lazy(() => import('./pages/Challenges'));
const WorkoutLibrary = lazy(() => import('./pages/WorkoutLibrary'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AIPage = lazy(() => import('./pages/AIPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const MediaPage = lazy(() => import('./pages/MediaPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DeveloperPortal = lazy(() => import('./pages/DeveloperPortal'));

// PWA & Offline Support
import { useOffline } from './hooks/useOffline';
import { usePWA } from './hooks/usePWA';
import OfflineBanner from './components/pwa/OfflineBanner';
import InstallPrompt from './components/pwa/InstallPrompt';
import UpdateBanner from './components/pwa/UpdateBanner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PrivacyConsentBanner from './components/ui/PrivacyConsentBanner';
import { useNativeLayout } from './hooks/useNativeLayout';

// Page loader placeholder
const PageLoader = () => (
  <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
    <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
  </div>
);

const queryClient = new QueryClient();

// Route Protection Guard
const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="relative flex items-center justify-center">
          <span className="material-symbols-outlined text-brand-650 dark:text-brand-500 text-5xl animate-spin">
            progress_activity
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Layout for private dashboard pages
const AppLayout: React.FC = () => {
  const { profile } = useAuth();
  const { isOnline } = useOffline(profile?.id);
  const { isInstallable, isUpdateAvailable, triggerInstall, handleUpdateReload } = usePWA(profile?.id);
  useNativeLayout();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <OfflineBanner isOnline={isOnline} />
      <InstallPrompt isInstallable={isInstallable} onInstall={triggerInstall} />
      <UpdateBanner isUpdateAvailable={isUpdateAvailable} onUpdate={handleUpdateReload} />
      <PrivacyConsentBanner userId={profile?.id || ''} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RealtimeProvider>
            <Router>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Marketing Route */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* Guest Route (Auth Forms) */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    
                    {/* Protected Dashboard Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/fitness" element={<FitnessTracker />} />
                        <Route path="/friends" element={<Social />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/challenges" element={<Challenges />} />
                        <Route path="/workouts" element={<WorkoutLibrary />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/ai" element={<AIPage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/media" element={<MediaPage />} />
                        <Route path="/devdocs" element={<DeveloperPortal />} />
                      </Route>
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Router>
            
            {/* React Hot Toast notification center */}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: '600'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff'
                  }
                }
              }}
            />
          </RealtimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
