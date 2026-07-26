// FitSync Component: AnnouncementPanel
// Form container publishing global announcements and maintenance banners

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

interface AnnouncementPanelProps {
  onPublish: (title: string, content: string, type: 'global' | 'maintenance' | 'release_notes' | 'emergency') => Promise<void>;
  loading?: boolean;
}

export const AnnouncementPanel: React.FC<AnnouncementPanelProps> = ({
  onPublish,
  loading = false
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'global' | 'maintenance' | 'release_notes' | 'emergency'>('global');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      await onPublish(title, content, type);
      setTitle('');
      setContent('');
      toast.success('System banner published!');
    } catch {
      toast.error('Failed to publish announcement.');
    }
  };

  return (
    <Card variant="glass" className="p-5 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl text-left select-none max-w-xl mx-auto">
      <h3 className="text-sm font-black text-slate-855 dark:text-white mb-4">Publish System Announcement</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Announcement Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
          >
            <option value="global">Global Bulletin (All users)</option>
            <option value="maintenance">Maintenance Schedule banner</option>
            <option value="release_notes">System Version Release Notes</option>
            <option value="emergency">Emergency Header alert</option>
          </select>
        </div>

        <Input
          label="Banner Title"
          placeholder="e.g. Schedule Maintenance Notice"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Content Description</label>
          <textarea
            rows={4}
            placeholder="Write the summary to be displayed on top banners..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading} isLoading={loading} leftIcon="campaign">
            Publish Alert
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AnnouncementPanel;
