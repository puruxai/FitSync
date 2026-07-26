// FitSync Component: WorkoutPlayer
// Renders workout player overlays with interactive sets counters, exercise clocks, rest states, and logs progress

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Exercise } from '../../services/exercise';

interface WorkoutPlayerProps {
  title: string;
  category: string;
  exercises: Exercise[];
  onFinish: (duration: number, calories: number, percent: number, completedCount: number) => Promise<void>;
  onCancel: () => void;
  estCalories: number;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  title,
  category,
  exercises,
  onFinish,
  onCancel,
  estCalories
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // seconds
  const [isPaused, setIsPaused] = useState(false);

  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [completedExercisesCount, setCompletedExercisesCount] = useState(0);

  const currentExercise = exercises[currentIdx];

  // 1. Initialize clock for current exercise or rest stage
  useEffect(() => {
    if (!currentExercise) return;
    if (isResting) {
      setTimeLeft(currentExercise.rest_time || 30);
    } else {
      setTimeLeft(currentExercise.duration || 45); // default 45s if reps-based
    }
  }, [currentIdx, currentSet, isResting, currentExercise]);

  // 2. Ticker timer loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTotalSecondsElapsed(prev => prev + 1);

      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStageComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, isResting]);

  const handleStageComplete = () => {
    if (isResting) {
      // Completed rest -> go to next exercise or next set
      setIsResting(false);
    } else {
      // Completed exercise set -> go to rest state
      setIsResting(true);
      if (currentSet < currentExercise.sets) {
        setCurrentSet(prev => prev + 1);
      } else {
        // Completed all sets for this exercise
        setCompletedExercisesCount(prev => prev + 1);
        if (currentIdx < exercises.length - 1) {
          setCurrentIdx(prev => prev + 1);
          setCurrentSet(1);
        } else {
          // Finished entire workout!
          handleFinishWorkout();
        }
      }
    }
  };

  const handleFinishWorkout = async () => {
    const elapsedMinutes = Math.max(1, Math.round(totalSecondsElapsed / 60));
    const completionPercent = Math.round((completedExercisesCount / exercises.length) * 100) || 100;
    const caloriesBurned = Math.round((completionPercent / 100) * estCalories);

    await onFinish(elapsedMinutes, caloriesBurned, completionPercent, completedExercisesCount);
  };

  const handleSkip = () => {
    handleStageComplete();
  };

  if (!currentExercise) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-400 text-sm font-semibold">No exercises configured in this workout.</p>
        <Button onClick={onCancel} className="mt-4">Close</Button>
      </div>
    );
  }

  const overallPercent = Math.round(((currentIdx * currentExercise.sets + currentSet) / (exercises.length * currentExercise.sets)) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-xl p-6 md:p-8 border border-slate-800 text-center space-y-6 select-none bg-slate-900/40 text-white">
        
        {/* Header Title */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="text-left">
            <span className="text-[8px] font-black uppercase text-brand-400 tracking-wider">
              Playing Workout: {category.toUpperCase()}
            </span>
            <h3 className="text-sm font-black truncate max-w-xs">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
            <span>Overall Progress</span>
            <span>{overallPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Stage display block */}
        <div className="py-6 space-y-4">
          {isResting ? (
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">Rest Time</span>
              <h2 className="text-4xl font-black">{timeLeft}s</h2>
              <p className="text-[10px] text-slate-400 font-semibold">Prepare for Set {currentSet} of {currentExercise.name}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-black text-brand-400 uppercase tracking-widest block">
                Exercise {currentIdx + 1} of {exercises.length} • Set {currentSet} of {currentExercise.sets}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentExercise.name}</h2>
              
              {/* Ticking Seconds or Reps Tag */}
              {currentExercise.duration ? (
                <div className="space-y-1">
                  <h3 className="text-5xl font-black text-slate-100">{timeLeft}s</h3>
                  <p className="text-[9px] text-slate-400 font-bold">Hold position</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-5xl font-black text-brand-500">{currentExercise.reps} Reps</h3>
                  <p className="text-[9px] text-slate-400 font-bold">Perform repetitions at your own pace</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Toggles Control Row */}
        <div className="flex justify-center items-center gap-4 select-none">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPaused(!isPaused)}
            leftIcon={isPaused ? 'play_arrow' : 'pause'}
            className="border-slate-800 text-slate-300 hover:text-white"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button 
            size="md" 
            onClick={handleSkip} 
            rightIcon="skip_next"
          >
            Skip Set
          </Button>
        </div>

        {/* Safety tip footer */}
        {currentExercise.instructions && currentExercise.instructions.length > 0 && (
          <div className="bg-slate-850/50 p-4 rounded-2xl border border-slate-800/40 text-left">
            <span className="text-[8px] font-black uppercase text-slate-400">Step Instructions</span>
            <p className="text-[10px] text-slate-300 font-semibold leading-relaxed mt-1">
              {currentExercise.instructions[0]}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs text-slate-500 font-semibold">
          <span>Elapsed: {Math.floor(totalSecondsElapsed / 60)}m {totalSecondsElapsed % 60}s</span>
          <button onClick={handleFinishWorkout} className="text-brand-400 hover:underline cursor-pointer">
            Finish Session early
          </button>
        </div>
      </Card>
    </div>
  );
};

export default WorkoutPlayer;
