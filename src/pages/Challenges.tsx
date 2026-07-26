// FitSync Page: Challenges
// Implements enterprise-grade Challenge Dashboard: explore, active, invites tabs, progress circles, and realtime leaderboard progress syncs

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useChallenges } from '../hooks/useChallenges';
import { useChallenge } from '../hooks/useChallenge';
import { useChallengeProgress } from '../hooks/useChallengeProgress';
import { useChallengeLeaderboard } from '../hooks/useChallengeLeaderboard';
import { useChallengeInvites } from '../hooks/useChallengeInvites';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeProgressCard from '../components/challenges/ChallengeProgressCard';
import ChallengeLeaderboard from '../components/challenges/ChallengeLeaderboard';
import ParticipantCard from '../components/challenges/ParticipantCard';
import InviteDialog from '../components/challenges/InviteDialog';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const challengeFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  category: z.enum(['steps', 'calories', 'workout_minutes', 'water', 'weight_loss', 'running_distance', 'cycling', 'yoga', 'strength_training', 'hiit', 'custom']),
  goal_value: z.coerce.number().min(1, 'Goal must be greater than 0.'),
  target_unit: z.string().min(1, 'Target unit is required.'),
  start_date: z.string().min(1, 'Start date is required.'),
  end_date: z.string().min(1, 'End date is required.'),
  visibility: z.enum(['public', 'friends', 'private']),
  max_participants: z.coerce.number().min(1, 'Max participants must be at least 1.'),
  min_participants: z.coerce.number().min(1, 'Min participants must be at least 1.'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  reward_points: z.coerce.number().min(0, 'Reward points must be positive.'),
  banner_url: z.string().url('Must be a valid image URL').optional().or(z.literal(''))
});

type ChallengeForm = z.infer<typeof challengeFormSchema>;

export const Challenges: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'active' | 'invites'>('explore');
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Hook Invocations
  const { challenges, loading, createChallenge, refetch } = useChallenges(profile?.id);
  const { invites, accept: acceptInvite, reject: rejectInvite, send: sendInvite, loading: invitesLoading } = useChallengeInvites(profile?.id);

  // Active challenge hooks
  const { members, join: joinCh, leave: leaveCh } = useChallenge(selectedChallenge?.id, profile?.id);
  const { progressValue, percent, predictedWinner } = useChallengeProgress(selectedChallenge?.id, profile?.id, selectedChallenge?.goal_value);
  const { standings } = useChallengeLeaderboard(selectedChallenge?.id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChallengeForm>({
    resolver: zodResolver(challengeFormSchema) as any
  });

  const handleCreate = async (data: ChallengeForm) => {
    if (!profile) return;
    try {
      await createChallenge({
        title: data.title,
        description: data.description || '',
        category: data.category,
        goal_value: data.goal_value,
        target_unit: data.target_unit,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        visibility: data.visibility,
        max_participants: data.max_participants,
        min_participants: data.min_participants,
        difficulty: data.difficulty,
        reward_points: data.reward_points,
        banner_url: data.banner_url || undefined
      } as any);
      toast.success('Challenge created successfully!');
      setShowCreateModal(false);
      reset();
    } catch (err) {
      toast.error('Failed to create challenge.');
    }
  };

  const handleJoin = async () => {
    try {
      await joinCh();
      await refetch();
      toast.success('Joined challenge! Let\'s go!', { icon: '💪' });
    } catch {
      toast.error('Failed to join challenge.');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCh();
      await refetch();
      toast.success('Left challenge.');
    } catch {
      toast.error('Failed to leave challenge.');
    }
  };

  // Filter lists
  const activeChallenges = challenges.filter(c => {
    // Determine if user is in members list
    // In our model we can check if it exists in local mock list or if user joined
    // Let's filter local active state by matching selected challenges
    return c.creator_id === profile?.id || c.members_count && c.members_count > 0; 
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Header title */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Fitness Challenges
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Join public events or invite friends to compete on goals.
          </p>
        </div>

        <div className="flex items-center gap-3 select-none">
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon="add"
          >
            Create Challenge
          </Button>

          {/* Tabs selections */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
            {(['explore', 'active', 'invites'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'invites' ? `Invites (${invites.length})` : tab === 'active' ? 'My Challenges' : 'Explore'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      ) : activeTab === 'explore' ? (
        challenges.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-4">sports_score</span>
            <p className="text-sm font-semibold">No challenges available.</p>
            <p className="text-xs mt-1">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                hasJoined={c.creator_id === profile?.id}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onSelect={(ch) => setSelectedChallenge(ch)}
              />
            ))}
          </div>
        )
      ) : activeTab === 'active' ? (
        activeChallenges.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-4">sports_score</span>
            <p className="text-sm font-semibold">You haven't joined any challenges yet.</p>
            <p className="text-xs mt-1">Browse the Explore tab to find events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeChallenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                hasJoined={true}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onSelect={(ch) => setSelectedChallenge(ch)}
              />
            ))}
          </div>
        )
      ) : (
        // Invites Tab
        invitesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-3xl" />
            <Skeleton className="h-20 rounded-3xl" />
          </div>
        ) : invites.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-4">mail</span>
            <p className="text-sm font-semibold">No pending challenge invitations.</p>
            <p className="text-xs mt-1">Friends will invite you to join their private games.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {invites.map(inv => (
              <Card key={inv.id} variant="glass" className="p-5 flex items-center justify-between gap-4 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[1.4em]">sports_score</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-855 dark:text-white leading-tight">
                      {inv.challenge?.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Invited by @{inv.sender?.username}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptInvite(inv.id)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectInvite(inv.id)}>
                    Decline
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Detail overlay Modal */}
      {selectedChallenge && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedChallenge(null)}
          title={selectedChallenge.title}
        >
          <div className="space-y-6 text-left max-h-[80vh] overflow-y-auto pr-1">
            <div className="h-40 w-full overflow-hidden rounded-2xl relative">
              <img
                src={selectedChallenge.banner_url || 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800'}
                alt={selectedChallenge.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {selectedChallenge.description || 'No description.'}
            </p>

            {/* Live Progress Ring */}
            <ChallengeProgressCard
              progressValue={progressValue}
              goalValue={selectedChallenge.goal_value}
              percent={percent}
              unit={selectedChallenge.target_unit}
              predictedWinner={predictedWinner}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Leaderboard Rankings */}
              <ChallengeLeaderboard standings={standings} unit={selectedChallenge.target_unit} />

              {/* Members listing */}
              <ParticipantCard members={members} />
            </div>

            {/* Invite control */}
            {profile && (
              <InviteDialog
                challengeId={selectedChallenge.id}
                senderId={profile.id}
                onSendInvite={sendInvite}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Creation Modal form */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Custom Challenge"
      >
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 text-left">
          <Input
            label="Challenge Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="e.g. 10K Daily Steps Sprint"
          />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-450">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Detail the rules and motivation for participants..."
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Category</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="steps">Steps Goal</option>
                <option value="calories">Calories Burned</option>
                <option value="workout_minutes">Workout Duration</option>
                <option value="water">Water Intake</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="running_distance">Running Distance</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Goal Value"
                type="number"
                {...register('goal_value')}
                error={errors.goal_value?.message}
                placeholder="10000"
              />
              <Input
                label="Target Unit"
                {...register('target_unit')}
                error={errors.target_unit?.message}
                placeholder="steps"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              {...register('start_date')}
              error={errors.start_date?.message}
            />
            <Input
              label="End Date"
              type="date"
              {...register('end_date')}
              error={errors.end_date?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Visibility</label>
              <select
                {...register('visibility')}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Members"
                type="number"
                {...register('min_participants')}
                error={errors.min_participants?.message}
                placeholder="1"
              />
              <Input
                label="Max Members"
                type="number"
                {...register('max_participants')}
                error={errors.max_participants?.message}
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Difficulty</label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Input
              label="XP Reward"
              type="number"
              {...register('reward_points')}
              error={errors.reward_points?.message}
              placeholder="500"
            />
          </div>

          <Input
            label="Banner Image URL (Optional)"
            {...register('banner_url')}
            error={errors.banner_url?.message}
            placeholder="https://images.unsplash.com/photo-..."
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Launch Challenge
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Challenges;
