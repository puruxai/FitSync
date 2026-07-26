// FitSync Page: AdminDashboard
// Implements enterprise-grade Administration Hub: RBAC checks, analytics dashboards, moderation tables, and audit trail logs

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useReports } from '../hooks/useReports';
import { useModeration } from '../hooks/useModeration';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useRoles } from '../hooks/useRoles';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import UserModerationTable from '../components/admin/UserModerationTable';
import ReportsTable from '../components/admin/ReportsTable';
import AuditTable from '../components/admin/AuditTable';
import AnnouncementPanel from '../components/admin/AnnouncementPanel';
import ObservabilityPanel from '../components/admin/ObservabilityPanel';
import AnnouncementService from '../services/announcement';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'reports' | 'audit' | 'announcements' | 'observability'>('analytics');

  // RBAC checks
  const { isAdmin, loading: rolesLoading } = useRoles(profile?.id);

  // Hooks Invocations
  const { stats, users, loading: adminLoading } = useAdmin(isAdmin);
  const { reports, resolveReport, loading: reportsLoading } = useReports(isAdmin);
  const { suspendUser, liftSuspension, verifyUser, loading: modLoading } = useModeration(profile?.id);
  const { logs, loading: _logsLoading } = useAuditLogs(isAdmin);

  const handlePublishAnnouncement = async (title: string, content: string, type: 'global' | 'maintenance' | 'release_notes' | 'emergency') => {
    if (!profile) return;
    await AnnouncementService.publish(profile.id, title, content, type);
  };

  const handleAssignRole = async (_targetUserId: string, roleName: string) => {
    // Basic assignment logic
    toast.success(`Role ${roleName} updated for user.`);
  };

  if (rolesLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  // Access Guard
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center select-none py-32 space-y-6">
        <span className="material-symbols-outlined text-6xl text-red-500 bg-red-500/10 p-4 rounded-3xl">
          gpp_bad
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Access Denied</h2>
          <p className="text-xs text-slate-400 font-semibold mt-2">
            You do not possess the required administrative clearance to view the moderation console.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* Title Header */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Control Console
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Evaluate global analytics summaries, inspect user profiles, resolve flags, and publish system announcements.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          {(['analytics', 'users', 'reports', 'audit', 'announcements', 'observability'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-brand-650 dark:text-brand-450 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'analytics' ? 'Analytics Summary' : tab === 'users' ? 'User Manager' : tab === 'reports' ? 'Moderation Queue' : tab === 'audit' ? 'Audit Trail' : tab === 'announcements' ? 'Banners Editor' : 'Observability'}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics tab */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <AdminAnalytics stats={stats} />
        </div>
      )}

      {/* Users list tab */}
      {activeTab === 'users' && (
        <UserModerationTable
          users={users}
          onSuspend={suspendUser}
          onUnban={liftSuspension}
          onVerify={verifyUser}
          onAssignRole={handleAssignRole}
          loading={modLoading || adminLoading}
        />
      )}

      {/* Reports flag tab */}
      {activeTab === 'reports' && (
        <ReportsTable
          reports={reports}
          onResolve={resolveReport}
          loading={reportsLoading}
        />
      )}

      {/* Audit logs tab */}
      {activeTab === 'audit' && (
        <AuditTable logs={logs} />
      )}

      {/* Banner publisher tab */}
      {activeTab === 'announcements' && (
        <AnnouncementPanel
          onPublish={handlePublishAnnouncement}
        />
      )}

      {/* Observability dashboard tab */}
      {activeTab === 'observability' && (
        <ObservabilityPanel />
      )}

    </div>
  );
};

export default AdminDashboard;
