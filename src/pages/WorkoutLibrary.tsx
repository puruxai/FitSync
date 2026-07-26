// FitSync Page: WorkoutLibrary
// Implements enterprise-grade Workout Hub: Catalog search, scheduler calendars, session histories, and full Workout Player active tracker

import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../hooks/useWorkouts';
import { useWorkout } from '../hooks/useWorkout';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useWorkoutPlanner } from '../hooks/useWorkoutPlanner';
import { useFavoriteWorkouts } from '../hooks/useFavoriteWorkouts';
import WorkoutCard from '../components/workout/WorkoutCard';
import ExerciseCard from '../components/workout/ExerciseCard';
import WorkoutPlayer from '../components/workout/WorkoutPlayer';
import WorkoutPlannerCalendar from '../components/workout/WorkoutPlannerCalendar';
import WorkoutHistoryTable from '../components/workout/WorkoutHistoryTable';
import WorkoutFilter from '../components/workout/WorkoutFilter';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const WorkoutLibrary: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'planner' | 'history' | 'favorites'>('catalog');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Workout state controllers
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [activePlayerWorkout, setActivePlayerWorkout] = useState<any | null>(null);
  
  // Planner Creation modals
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');

  // Hooks Invocations
  const { workouts, loading: catalogLoading } = useWorkouts();
  const { history, logSession, loading: historyLoading } = useWorkoutHistory(profile?.id);
  const { plans, currentPlan, schedule, assignWorkout, removeWorkout, createPlan, duplicatePlan, selectPlan, loading: plannerLoading } = useWorkoutPlanner(profile?.id);
  const { favorites, toggleFavorite, isFavorite } = useFavoriteWorkouts(profile?.id);

  // Load single workout exercises (for details overlay)
  const { exercises, loading: detailsLoading } = useWorkout(selectedWorkout?.id, profile?.id);
  const { exercises: playerExercises } = useWorkout(activePlayerWorkout?.id, profile?.id);

  // 1. Catalog filtering computation
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      // Category match
      if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;
      // Difficulty match
      if (selectedDifficulty !== 'all' && w.difficulty !== selectedDifficulty) return false;

      // Keyword match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = w.title.toLowerCase().includes(query);
        const descMatch = (w.description || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });
  }, [workouts, selectedCategory, selectedDifficulty, searchQuery]);

  const handleStartWorkout = (wk: any) => {
    setSelectedWorkout(null);
    setActivePlayerWorkout(wk);
    toast.success(`Starting ${wk.title}. Prepare yourself!`, { icon: '🔥' });
  };

  const handleFinishWorkout = async (duration: number, calories: number, percent: number, completedCount: number) => {
    if (!profile || !activePlayerWorkout) return;
    try {
      await logSession(
        activePlayerWorkout.id,
        activePlayerWorkout.title,
        duration,
        calories,
        percent,
        completedCount,
        activePlayerWorkout.category
      );
      toast.success(`Workout completed! Logged +${calories} kcal burned.`, { icon: '🏆' });
      setActivePlayerWorkout(null);
    } catch {
      toast.error('Failed to log completed session.');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    try {
      await createPlan(newPlanTitle, newPlanDesc);
      toast.success('Workout plan created successfully!');
      setShowCreatePlanModal(false);
      setNewPlanTitle('');
      setNewPlanDesc('');
    } catch {
      toast.error('Failed to create workout plan.');
    }
  };

  const handleDuplicatePlan = async (planId: string) => {
    try {
      await duplicatePlan(planId, `Copy of plan routine`);
      toast.success('Plan duplicated!');
    } catch {
      toast.error('Failed to clone plan.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Title block */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Workout Hub
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Browse active bodyweight routines, schedule calendars planner, and track session logs.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          {(['catalog', 'planner', 'history', 'favorites'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'catalog' ? 'Workout Library' : tab === 'planner' ? 'Weekly Planner' : tab === 'history' ? 'History Log' : 'Favorites'}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog view tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2">
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="search"
              />
            </div>
            <div className="md:col-span-2">
              <WorkoutFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
              />
            </div>
          </div>

          {catalogLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-4 text-slate-350">fitness_center</span>
              <p className="text-sm font-semibold">No workouts match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkouts.map(w => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  isFavorite={isFavorite(w.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(wk) => setSelectedWorkout(wk)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Planner view tab */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Active Plan:</h3>
              <select
                value={currentPlan?.id || ''}
                onChange={(e) => {
                  const found = plans.find(p => p.id === e.target.value);
                  if (found) selectPlan(found);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowCreatePlanModal(true)} leftIcon="add">
                New Plan
              </Button>
              {currentPlan && (
                <Button size="sm" variant="outline" onClick={() => handleDuplicatePlan(currentPlan.id)} leftIcon="content_copy">
                  Clone Plan
                </Button>
              )}
            </div>
          </div>

          {plannerLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-60 rounded-3xl" />
            </div>
          ) : (
            <WorkoutPlannerCalendar
              schedule={schedule}
              workouts={workouts}
              onAssignWorkout={assignWorkout}
              onRemoveWorkout={removeWorkout}
            />
          )}
        </div>
      )}

      {/* History view tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-white text-left select-none">Completed Session Logs</h3>
          
          {historyLoading ? (
            <Skeleton className="h-60 rounded-3xl" />
          ) : (
            <WorkoutHistoryTable history={history} />
          )}
        </div>
      )}

      {/* Favorites view tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-white text-left select-none">Favorited Routines</h3>
          
          {favorites.length === 0 ? (
            <div className="py-20 text-center text-slate-400 select-none">
              <span className="material-symbols-outlined text-5xl mb-4 text-slate-350">favorite_border</span>
              <p className="text-sm font-semibold">No favorites bookmarked yet.</p>
              <p className="text-xs mt-1">Click the heart icon on cards in Library to save routines here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(w => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(wk) => setSelectedWorkout(wk)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exercises listings Detail overlay Modal */}
      {selectedWorkout && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedWorkout(null)}
          title={selectedWorkout.title}
        >
          <div className="space-y-6 text-left max-h-[80vh] overflow-y-auto pr-1">
            <div className="h-44 w-full overflow-hidden rounded-2xl relative">
              <img
                src={selectedWorkout.cover_image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600'}
                alt={selectedWorkout.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            <div className="flex justify-between items-center select-none">
              <div className="space-y-0.5">
                <span className="text-[10px] text-brand-500 font-black uppercase">{selectedWorkout.category.replace('_', ' ')}</span>
                <h4 className="text-sm font-black text-slate-855 dark:text-white">Workout Overview</h4>
              </div>

              {/* Start Workout session Button */}
              <Button size="sm" onClick={() => handleStartWorkout(selectedWorkout)} leftIcon="play_arrow">
                Start Session
              </Button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {selectedWorkout.description}
            </p>

            {/* Exercises Lists */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Exercises Configured</h5>
              
              {detailsLoading ? (
                <Skeleton className="h-20 rounded-2xl" />
              ) : exercises.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center font-semibold">No exercises configured.</p>
              ) : (
                <div className="space-y-3">
                  {exercises.map((ex, idx) => (
                    <ExerciseCard key={ex.id} exercise={ex} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Active Workout Clock Overlay */}
      {activePlayerWorkout && playerExercises.length > 0 && (
        <WorkoutPlayer
          title={activePlayerWorkout.title}
          category={activePlayerWorkout.category}
          exercises={playerExercises}
          onFinish={handleFinishWorkout}
          onCancel={() => {
            setActivePlayerWorkout(null);
            toast.success('Workout tracker cancelled.');
          }}
          estCalories={activePlayerWorkout.calories}
        />
      )}

      {/* Create Planner Modal */}
      <Modal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        title="Create New Routine Plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-left">
          <Input
            label="Planner Title"
            placeholder="e.g. My Fat Loss Phase 1"
            value={newPlanTitle}
            onChange={(e) => setNewPlanTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</label>
            <textarea
              rows={3}
              placeholder="Outline the goals for this calendar routine plan..."
              value={newPlanDesc}
              onChange={(e) => setNewPlanDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/30 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 select-none">
            <Button variant="outline" type="button" onClick={() => setShowCreatePlanModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Launch Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkoutLibrary;
