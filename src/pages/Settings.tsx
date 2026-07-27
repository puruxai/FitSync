// FitSync Page: Settings
// Implements enterprise-grade Settings Dashboard: profile info, privacy locks, session revocations, password logs, and danger zones

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { usePrivacy } from '../hooks/usePrivacy';
import { useSecurity } from '../hooks/useSecurity';
import { useSessions } from '../hooks/useSessions';
import { useExport } from '../hooks/useExport';
import { AccountService } from '../services/account';
import PrivacyCard from '../components/settings/PrivacyCard';
import SecurityCard from '../components/settings/SecurityCard';
import SessionCard from '../components/settings/SessionCard';
import ExportCard from '../components/settings/ExportCard';
import DangerZone from '../components/settings/DangerZone';
import AccessibilitySettingsPanel from '../components/settings/AccessibilitySettingsPanel';
import ImageUploadModal from '../components/profile/ImageUploadModal';
import Avatar from '../components/profile/Avatar';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be under 20 characters.')
    .regex(/^[a-z0-9_]+$/, 'Use only lowercase, numbers, and underscores.'),
  bio: z.string().max(160, 'Bio must be under 160 characters.').optional(),
  location: z.string().optional(),
  fitnessGoal: z.string().optional(),
  age: z.coerce.number().min(5, 'Invalid age.').max(120).optional(),
  gender: z.string().optional(),
  height: z.coerce.number().min(50, 'Invalid height.').max(300).optional(),
  weight: z.coerce.number().min(20, 'Invalid weight.').max(500).optional(),
  phone: z.string().optional(),
  activityLevel: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional()
});

type ProfileFields = z.infer<typeof profileSchema>;

export const Settings: React.FC = () => {
  const { profile, updateProfileDetails, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security' | 'sessions' | 'accessibility' | 'danger'>('profile');
  const [uploadModalType, setUploadModalType] = useState<'avatar' | 'cover' | null>(null);

  // Form setups
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema) as any
  });

  // Hooks Invocations
  const { privacy, updatePrivacy, loading: privacyLoading } = usePrivacy(profile?.id);
  const { settings, devices, updateSettings, changePassword, removeTrustedDevice, loading: securityLoading } = useSecurity(profile?.id);
  const { sessions, revokeSession, revokeAllExceptCurrent, loading: sessionsLoading } = useSessions(profile?.id);
  const { exportData, exporting } = useExport(profile?.id);

  // Avatar Upload
  const { uploadAvatar, uploadCover, deleteAvatar, deleteCover, uploading: imageUploading } = useAvatarUpload(
    profile?.id,
    () => {
      toast.success('Image updated successfully!');
      window.location.reload();
    }
  );

  const loadSettingsData = async () => {
    if (!profile) return;
    reset({
      fullName: profile.full_name,
      username: profile.username,
      bio: profile.bio || '',
      location: profile.location || '',
      fitnessGoal: profile.fitness_goal || '',
      age: profile.age || undefined,
      gender: profile.gender || 'Not Specified',
      height: profile.height || undefined,
      weight: profile.weight || undefined,
      phone: profile.phone || '',
      activityLevel: profile.activity_level || 'Moderate',
      website: profile.website || '',
      instagram: profile.instagram || '',
      twitter: profile.twitter || ''
    });
  };

  useEffect(() => {
    if (profile) {
      loadSettingsData();
    }
  }, [profile]);

  const handleProfileSubmit = async (data: ProfileFields) => {
    if (!profile) return;
    try {
      const { success, error } = await updateProfileDetails({
        full_name: data.fullName,
        username: data.username,
        bio: data.bio,
        location: data.location,
        fitness_goal: data.fitnessGoal,
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        phone: data.phone,
        activity_level: data.activityLevel,
        website: data.website,
        instagram: data.instagram,
        twitter: data.twitter
      });

      if (success) {
        toast.success('Profile details saved!');
        reset(data);
      } else {
        toast.error(error || 'Failed to update details.');
      }
    } catch {
      toast.error('Error saving settings.');
    }
  };

  const handleDeactivate = async () => {
    if (!profile) return;
    await AccountService.deactivateAccount(profile.id);
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    await AccountService.deleteAccount(profile.id);
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center space-y-4 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl max-w-md mx-auto">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile Load Error</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Could not load user profile details.
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
            Account Management
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Configure granular profile visibility locks, passwords logs, active device sessions, and danger zones.
          </p>
        </div>

        {/* Tabs selections */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          {(['profile', 'privacy', 'security', 'sessions', 'accessibility', 'danger'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'profile' ? 'Profile Details' : tab === 'danger' ? 'Danger Zone' : tab === 'accessibility' ? 'Accessibility & Lang' : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Graphics banner card */}
            <Card variant="glass" className="relative overflow-hidden p-0 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <div className="h-32 bg-gradient-to-r from-brand-500 to-indigo-650 relative">
                {profile.cover_url ? (
                  <img src={profile.cover_url} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                )}
                <button
                  type="button"
                  onClick={() => setUploadModalType('cover')}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition-colors backdrop-blur-sm"
                >
                  Edit Cover
                </button>
              </div>

              <div className="px-6 pb-6 pt-12 flex justify-between items-end relative text-left select-none">
                <div className="absolute -top-12 left-6 border-4 border-white dark:border-slate-900 rounded-[1.8rem] overflow-hidden bg-slate-900">
                  <Avatar src={profile.avatar_url} alt={profile.full_name} size="lg" />
                  <button
                    type="button"
                    onClick={() => setUploadModalType('avatar')}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white"
                  >
                    <span className="material-symbols-outlined text-2xl">edit</span>
                  </button>
                </div>

                <div className="pl-28">
                  <h4 className="text-sm font-black text-slate-955 dark:text-white leading-none">{profile.full_name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">@{profile.username} | {profile.fitsync_id}</p>
                </div>
              </div>
            </Card>

            {/* Profile Forms card */}
            <Card variant="glass" className="p-6 text-left">
              <h3 className="text-sm font-black text-slate-950 dark:text-white mb-6">Profile Information</h3>
              
              <form onSubmit={handleSubmit(handleProfileSubmit as any)} className="space-y-4">
                {isDirty && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-4 animate-pulse">
                    <span className="material-symbols-outlined text-[1.3em]">warning</span>
                    <span>You have unsaved changes. Remember to click "Save Changes" before leaving.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Alex Rivera"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <Input
                    label="Username"
                    placeholder="alex_rivera"
                    error={errors.username?.message}
                    {...register('username')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Phone"
                    placeholder="+1 (555) 019-2834"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Location"
                    placeholder="Austin, TX"
                    error={errors.location?.message}
                    {...register('location')}
                  />
                </div>

                <Input
                  label="Fitness Goal"
                  placeholder="e.g. Burn 500 kcal daily, Train for marathon"
                  error={errors.fitnessGoal?.message}
                  {...register('fitnessGoal')}
                />

                <Input
                  label="Bio Description"
                  as="textarea"
                  placeholder="Share something about your fitness journey..."
                  error={errors.bio?.message}
                  {...register('bio')}
                />

                <hr className="border-slate-100 dark:border-slate-800/40 my-6" />
                <h4 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-wide">Biometrics Formulas</h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="Age"
                    type="number"
                    placeholder="25"
                    error={errors.age?.message}
                    {...register('age')}
                  />

                  <Input
                    label="Gender"
                    as="select"
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                      { value: 'Not Specified', label: 'Prefer not to say' }
                    ]}
                    error={errors.gender?.message}
                    {...register('gender')}
                  />

                  <Input
                    label="Height (cm)"
                    type="number"
                    placeholder="175"
                    error={errors.height?.message}
                    {...register('height')}
                  />

                  <Input
                    label="Weight (kg)"
                    type="number"
                    placeholder="70"
                    error={errors.weight?.message}
                    {...register('weight')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Activity Level"
                    as="select"
                    options={[
                      { value: 'Sedentary', label: 'Sedentary (Little to no exercise)' },
                      { value: 'Moderate', label: 'Moderate (Active 3-5 days/week)' },
                      { value: 'Active', label: 'Very Active (Heavy training 6-7 days/week)' }
                    ]}
                    error={errors.activityLevel?.message}
                    {...register('activityLevel')}
                  />

                  <Input
                    label="Personal Website"
                    placeholder="https://athleteblog.com"
                    error={errors.website?.message}
                    {...register('website')}
                  />
                </div>

                <hr className="border-slate-100 dark:border-slate-800/40 my-6" />
                <h4 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-wide">Social Media Handles</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Instagram Username"
                    placeholder="@alex_fit"
                    error={errors.instagram?.message}
                    {...register('instagram')}
                  />

                  <Input
                    label="Twitter/X Handle"
                    placeholder="@alex_rivera_x"
                    error={errors.twitter?.message}
                    {...register('twitter')}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8 select-none">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={loadSettingsData}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" leftIcon="save">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="glass" className="p-5 text-left text-xs font-semibold leading-relaxed">
              <h4 className="text-slate-900 dark:text-white font-black mb-3">Formula Tips</h4>
              <p className="text-slate-400 mb-3">
                FitSync uses age, height, and weight to calculate active BMI metrics and calorie burns. Keep them updated to ensure precision trackers.
              </p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && privacy && (
        <div className="max-w-2xl mx-auto">
          <PrivacyCard
            privacy={privacy}
            onUpdate={updatePrivacy}
            loading={privacyLoading}
          />
        </div>
      )}

      {activeTab === 'security' && settings && (
        <div className="max-w-2xl mx-auto">
          <SecurityCard
            settings={settings}
            devices={devices}
            onUpdateSettings={updateSettings}
            onChangePassword={changePassword}
            onRemoveDevice={removeTrustedDevice}
            loading={securityLoading}
          />
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="max-w-2xl mx-auto">
          <SessionCard
            sessions={sessions}
            onRevoke={revokeSession}
            onRevokeAll={revokeAllExceptCurrent}
            loading={sessionsLoading}
          />
        </div>
      )}

      {activeTab === 'accessibility' && (
        <div className="max-w-2xl mx-auto">
          <AccessibilitySettingsPanel />
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <ExportCard
            onExport={exportData}
            loading={exporting}
          />

          <DangerZone
            onDeactivate={handleDeactivate}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      )}

      {/* Upload Graphics modals */}
      {uploadModalType && (
        <ImageUploadModal
          isOpen={!!uploadModalType}
          onClose={() => setUploadModalType(null)}
          type={uploadModalType}
          currentImageUrl={uploadModalType === 'avatar' ? profile.avatar_url : profile.cover_url}
          onUpload={uploadModalType === 'avatar' ? uploadAvatar : uploadCover}
          onDelete={uploadModalType === 'avatar' ? deleteAvatar : deleteCover}
          loading={imageUploading}
        />
      )}
    </div>
  );
};

export default Settings;
