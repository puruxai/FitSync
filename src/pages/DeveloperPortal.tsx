// FitSync Page: DeveloperPortal
// Implements interactive developer portal: REST endpoints references, Realtime broadcast guides, and database RLS details

import React, { useState } from 'react';
import Card from '../components/ui/Card';

type DevTab = 'getting_started' | 'rest_api' | 'realtime' | 'database';

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DevTab>('getting_started');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8 text-left select-none">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          Developer Portal
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Explore OpenAPI 3.1 specifications, Postman collection downloads, database RLS constraints, and realtime configurations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 max-w-lg">
        {(['getting_started', 'rest_api', 'realtime', 'database'] as DevTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all cursor-pointer flex-1 ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'getting_started' && (
        <Card variant="glass" className="p-6 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-black dark:text-white uppercase tracking-wider">Getting Started Guide</h3>
            <p className="text-xs text-slate-400 font-semibold">Integrate your client script with the FitSync engine in 3 steps.</p>
          </div>
          <pre className="text-[10px] bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl dark:text-slate-350 overflow-x-auto">
{`# 1. Install standard client SDK
npm install fitsync-sdk-node

# 2. Configure credentials
export FITSYNC_API_KEY="fs_pk_live_12345"

# 3. Initialize metrics log
const client = new FitSyncClient(process.env.FITSYNC_API_KEY);
await client.fitness.logSteps({ steps: 8500 });`}
          </pre>
        </Card>
      )}

      {activeTab === 'rest_api' && (
        <div className="space-y-6">
          <Card variant="glass" className="p-6 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-3">
            <span className="bg-emerald-500/10 text-emerald-500 font-black px-2 py-0.5 rounded text-[10px] uppercase">POST</span>
            <span className="text-xs font-black dark:text-white ml-2">/auth/login</span>
            <p className="text-[11px] text-slate-400 font-semibold">Generates user session access token from credentials.</p>
          </Card>

          <Card variant="glass" className="p-6 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-3">
            <span className="bg-emerald-500/10 text-emerald-500 font-black px-2 py-0.5 rounded text-[10px] uppercase">POST</span>
            <span className="text-xs font-black dark:text-white ml-2">/fitness/steps</span>
            <p className="text-[11px] text-slate-400 font-semibold">Logs daily step counts and returns consolidated summaries.</p>
          </Card>
        </div>
      )}

      {activeTab === 'realtime' && (
        <Card variant="glass" className="p-6 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black dark:text-white uppercase tracking-wider">Realtime Broadcast Channels</h3>
            <p className="text-xs text-slate-400 font-semibold">Listen to user presence changes and challenge statuses updates.</p>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/20 pb-2">
              <span className="font-bold dark:text-slate-300">"notifications:&#123;userId&#125;"</span>
              <span className="text-slate-400 font-semibold">Pushes in-app alert flags</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/20 pb-2">
              <span className="font-bold dark:text-slate-300">"presence:&#123;challengeId&#125;"</span>
              <span className="text-slate-400 font-semibold">Tracks lobby participant coordinates</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'database' && (
        <Card variant="glass" className="p-6 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black dark:text-white uppercase tracking-wider">Database Tables & RLS Policies</h3>
            <p className="text-xs text-slate-400 font-semibold">Inspect schema locks guarding data scopes in PostgreSQL.</p>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/20 pb-2">
              <span className="font-bold dark:text-slate-300">`profiles`</span>
              <span className="text-slate-400 font-semibold">Owner select, update locks enabled</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/20 pb-2">
              <span className="font-bold dark:text-slate-300">`challenges`</span>
              <span className="text-slate-400 font-semibold">Public select, participant update locks</span>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};

export default DeveloperPortal;
