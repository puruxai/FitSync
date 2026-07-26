// FitSync Page: Notifications
// Implements enterprise-grade Notification Center: inbox, pinned, archived tabs, time groupings, alerts preferences, and reminders settings

import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { useReminder } from '../hooks/useReminder';
import NotificationCard from '../components/notifications/NotificationCard';
import ReminderCard from '../components/notifications/ReminderCard';
import PreferencePanel from '../components/notifications/PreferencePanel';
import EmptyState from '../components/notifications/EmptyState';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const Notifications: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'pinned' | 'archived' | 'reminders' | 'settings'>('inbox');
  
  // Searches & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // Hooks Invocations
  const { notifications, loading, markRead, markAllRead, togglePin, toggleArchive, remove } = useNotifications(profile?.id);
  const { preferences, update: updatePrefs, loading: prefsLoading } = useNotificationPreferences(profile?.id);
  const { reminders, save: saveReminder, remove: deleteReminder, loading: remindersLoading } = useReminder(profile?.id);

  // Reminder form states
  const [remType, setRemType] = useState<'workout' | 'water' | 'steps' | 'sleep' | 'weight'>('workout');
  const [remTime, setRemTime] = useState('08:00');
  const [remDays, setRemDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [remMessage, setRemMessage] = useState('');

  // 1. Filtered Notifications computation
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      // Tab matching
      if (activeTab === 'pinned' && !notif.is_pinned) return false;
      if (activeTab === 'archived' && !notif.is_archived) return false;
      if (activeTab === 'inbox' && (notif.is_archived || notif.is_pinned)) return false;

      // Category matching
      if (categoryFilter !== 'all' && notif.category !== categoryFilter) return false;

      // Date matching
      if (dateFilter !== 'all') {
        const createdDate = new Date(notif.created_at).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          if (now - createdDate > 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === 'week') {
          if (now - createdDate > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === 'month') {
          if (now - createdDate > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // Keyword Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = notif.title.toLowerCase().includes(query);
        const msgMatch = notif.message.toLowerCase().includes(query);
        if (!titleMatch && !msgMatch) return false;
      }

      return true;
    });
  }, [notifications, activeTab, categoryFilter, dateFilter, searchQuery]);

  // 2. Group notifications by Date (Today, Yesterday, Older)
  const groupedNotifications = useMemo(() => {
    const today: typeof filteredNotifications = [];
    const yesterday: typeof filteredNotifications = [];
    const older: typeof filteredNotifications = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    filteredNotifications.forEach(n => {
      const time = new Date(n.created_at).getTime();
      if (time >= startOfToday) {
        today.push(n);
      } else if (time >= startOfYesterday) {
        yesterday.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, older };
  }, [filteredNotifications]);

  const handleMarkAllRead = async () => {
    if (!profile) return;
    try {
      await markAllRead();
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to update notifications.');
    }
  };

  const handleToggleDay = (day: string) => {
    setRemDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await saveReminder({
        id: '',
        user_id: profile.id,
        type: remType,
        time: remTime,
        days: remDays,
        message: remMessage || `Time for your daily ${remType} check!`,
        is_active: true
      });
      toast.success('Reminder scheduled successfully!');
      setShowAddReminderModal(false);
      setRemMessage('');
    } catch {
      toast.error('Failed to schedule reminder.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto pb-24 lg:pb-8">
      {/* Title Header */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Notification Center
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Review alerts, manage preferences, and schedule workout reminders.
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          {(['inbox', 'pinned', 'archived', 'reminders', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'inbox' ? 'Inbox' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main dashboard content */}
      {activeTab === 'settings' ? (
        prefsLoading || !preferences ? (
          <Skeleton className="h-64 rounded-3xl" />
        ) : (
          <PreferencePanel
            preferences={preferences}
            onUpdate={updatePrefs}
          />
        )
      ) : activeTab === 'reminders' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center select-none">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Active Habit Reminders</h3>
            <Button size="sm" onClick={() => setShowAddReminderModal(true)} leftIcon="add">
              Add Reminder
            </Button>
          </div>

          {remindersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-3xl" />
              <Skeleton className="h-20 rounded-3xl" />
            </div>
          ) : reminders.length === 0 ? (
            <EmptyState
              icon="notifications_off"
              title="No reminders scheduled"
              description="Schedule alarms to keep tabs on step goals, workouts, and sleep targets."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map(rem => (
                <ReminderCard
                  key={rem.id}
                  reminder={rem}
                  onToggleActive={saveReminder}
                  onDelete={(id) => deleteReminder(id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Inbox, Pinned, Archived tab lists
        <div className="space-y-6">
          {/* Filters and search panel */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="search"
              />
            </div>
            
            <div className="space-y-1 text-left">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="friend">Friends</option>
                <option value="challenge">Challenges</option>
                <option value="workout">Workouts</option>
                <option value="reminder">Reminders</option>
                <option value="leaderboard">Leaderboards</option>
                <option value="achievement">Achievements</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 days</option>
                <option value="month">Past 30 days</option>
              </select>
            </div>
          </div>

          {/* Mark All Read button */}
          {activeTab === 'inbox' && filteredNotifications.some(n => !n.is_read) && (
            <div className="flex justify-end select-none">
              <Button size="sm" variant="outline" onClick={handleMarkAllRead} leftIcon="done_all">
                Mark All as Read
              </Button>
            </div>
          )}

          {/* List display */}
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 rounded-3xl" />
              <Skeleton className="h-24 rounded-3xl" />
              <Skeleton className="h-24 rounded-3xl" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon="notifications_none"
              title="Inbox is clear"
              description="You have no notifications matching this category filter."
            />
          ) : (
            <div className="space-y-6 text-left">
              {/* Group Today */}
              {groupedNotifications.today.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Today
                  </h4>
                  {groupedNotifications.today.map(n => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onRead={markRead}
                      onPin={togglePin}
                      onArchive={toggleArchive}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}

              {/* Group Yesterday */}
              {groupedNotifications.yesterday.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Yesterday
                  </h4>
                  {groupedNotifications.yesterday.map(n => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onRead={markRead}
                      onPin={togglePin}
                      onArchive={toggleArchive}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}

              {/* Group Older */}
              {groupedNotifications.older.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Older Notifications
                  </h4>
                  {groupedNotifications.older.map(n => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onRead={markRead}
                      onPin={togglePin}
                      onArchive={toggleArchive}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Reminder Modal form */}
      <Modal
        isOpen={showAddReminderModal}
        onClose={() => setShowAddReminderModal(false)}
        title="Schedule Habit Reminder"
      >
        <form onSubmit={handleAddReminder} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reminder Type</label>
            <select
              value={remType}
              onChange={(e) => setRemType(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
            >
              <option value="workout">Workout Session</option>
              <option value="water">Water Intake</option>
              <option value="steps">Daily Steps Goal</option>
              <option value="sleep">Sleep Target</option>
              <option value="weight">Weight Scale check</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Time</label>
              <input
                type="time"
                value={remTime}
                onChange={(e) => setRemTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Days</label>
            <div className="flex flex-wrap gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const isActive = remDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-brand-500/10 border-brand-500 text-brand-500' 
                        : 'border-slate-200 text-slate-400 dark:border-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Custom Message"
            placeholder="e.g. Don't forget to drink 250ml of water!"
            value={remMessage}
            onChange={(e) => setRemMessage(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 select-none">
            <Button variant="outline" type="button" onClick={() => setShowAddReminderModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Set Alarm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Notifications;
