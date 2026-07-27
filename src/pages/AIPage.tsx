// FitSync Page: AIPage
// Coordinates conversational chat coaches, biometrics models prediction, custom routines builders, and credentials setting tabs

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAI } from '../hooks/useAI';
import { useChat } from '../hooks/useChat';
import { useWorkoutAI } from '../hooks/useWorkoutAI';
import { useDietAI } from '../hooks/useDietAI';
import { usePrediction } from '../hooks/usePrediction';
import { useInsights } from '../hooks/useInsights';
import AIChat from '../components/ai/AIChat';
import AIDashboard from '../components/ai/AIDashboard';
import WorkoutGenerator from '../components/ai/WorkoutGenerator';
import DietGenerator from '../components/ai/DietGenerator';
import AISettingsPanel from '../components/ai/AISettingsPanel';
import Skeleton from '../components/ui/Skeleton';

export const AIPage: React.FC = () => {
  const { profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'coach' | 'dashboard' | 'workout' | 'diet' | 'settings'>('coach');

  // Load custom hooks
  const { settings, updateSettings, loading: aiLoading } = useAI(profile?.id);
  const {
    conversations,
    activeConv,
    messages,
    streamingText,
    setActiveConv,
    createNewThread,
    sendMessage,
    clearHistory,
    exportChatHistory
  } = useChat(profile?.id);

  const { generateWorkout, result: workoutResult, loading: workoutLoading, clearResult: clearWorkout } = useWorkoutAI(profile?.id);
  const { generateDietPlan, result: dietResult, loading: dietLoading, clearResult: clearDiet } = useDietAI(profile?.id);
  const { predictions, loading: predLoading } = usePrediction(profile?.id);
  const { insights, loading: insLoading } = useInsights(profile?.id);

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
      
      {/* Title block */}
      <div className="text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            AI Fitness Hub
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Connect pluggable AI providers to generate custom workout plans, meal structures, and health metrics predictions.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          {(['coach', 'dashboard', 'workout', 'diet', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'coach' ? 'AI Coach' : tab === 'workout' ? 'Workout Generator' : tab === 'diet' ? 'Diet Planner' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Render selected tabs */}
      {activeTab === 'coach' && (
        <AIChat
          conversations={conversations}
          activeConv={activeConv}
          messages={messages}
          streamingText={streamingText}
          onSelectConv={setActiveConv}
          onSend={sendMessage}
          onClear={clearHistory}
          onExport={exportChatHistory}
          onCreateThread={createNewThread}
        />
      )}

      {activeTab === 'dashboard' && (
        <AIDashboard
          insights={insights}
          predictions={predictions}
          loading={predLoading || insLoading}
        />
      )}

      {activeTab === 'workout' && (
        <WorkoutGenerator
          onGenerate={generateWorkout}
          result={workoutResult}
          loading={workoutLoading}
          onClear={clearWorkout}
        />
      )}

      {activeTab === 'diet' && (
        <DietGenerator
          onGenerate={generateDietPlan}
          result={dietResult}
          loading={dietLoading}
          onClear={clearDiet}
        />
      )}

      {activeTab === 'settings' && settings && (
        <AISettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          loading={aiLoading}
        />
      )}

    </div>
  );
};

export default AIPage;
