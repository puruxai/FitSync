// FitSync Page: Social
// Implements enterprise-grade social dashboard: friends lists, requests, live search, blocked lists, activity feeds, and presence selectors

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { useFriendRequests } from '../hooks/useFriendRequests';
import { useSearchUsers } from '../hooks/useSearchUsers';
import { useBlockedUsers } from '../hooks/useBlockedUsers';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useFriendActivity } from '../hooks/useFriendActivity';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FriendCard from '../components/social/FriendCard';
import FriendRequestCard from '../components/social/FriendRequestCard';
import UserSearchCard from '../components/social/UserSearchCard';
import BlockedUserCard from '../components/social/BlockedUserCard';
import FriendSuggestionCard from '../components/social/FriendSuggestionCard';
import ActivityCard from '../components/social/ActivityCard';

export const Social: React.FC = () => {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'blocked' | 'feed'>('friends');
  const [searchInput, setSearchInput] = useState('');

  // 1. Hook Invocations
  const { friends, removeFriend, toggleFavorite, loading: friendsLoading } = useFriends(profile?.id);
  const { requests, acceptRequest, rejectRequest, sendRequest, loading: requestsLoading } = useFriendRequests(profile?.id);
  const { results, suggestions, recentSearches, search, saveSearchHistory, clearHistory, loading: searchLoading } = useSearchUsers(profile?.id);
  const { blockedList, blockUser, unblockUser, loading: blocksLoading } = useBlockedUsers(profile?.id);
  const { feed } = useFriendActivity(profile?.id);

  // Extract friend IDs to track online presence
  const friendIds = friends.map(f => f.friend_id).filter((id): id is string => !!id);
  const { status: ownPresence, updateStatus, trackedStatuses } = useOnlineStatus(profile?.id, friendIds);

  // 2. Debounced search trigger
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      search(searchInput);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchInput, search]);

  const handleSearchHistoryClick = (query: string) => {
    setSearchInput(query);
  };

  const handleSendInvite = async (username: string) => {
    try {
      await sendRequest(username);
      await saveSearchHistory(username);
    } catch {}
  };

  const handleBlockAction = async (targetId: string, name: string) => {
    if (!confirm(`Are you sure you want to block ${name}?`)) return;
    await blockUser(targetId, name);
  };

  // Status mapping colors
  const presenceColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    working_out: 'bg-violet-500',
    offline: 'bg-slate-400'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      
      {/* 1. Header with presence selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Social Connect
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Build your fitness circle, sync milestones, and compete together.
          </p>
        </div>

        {/* Presence Selector dropdown */}
        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${presenceColors[ownPresence]}`} />
            <span className="capitalize">{ownPresence.replace('_', ' ')}</span>
          </div>
          
          <select
            value={ownPresence}
            onChange={(e) => updateStatus(e.target.value as any)}
            className="bg-transparent border-0 font-bold focus:ring-0 text-slate-650 dark:text-slate-200 cursor-pointer outline-none"
          >
            <option value="online">Online</option>
            <option value="away">Away</option>
            <option value="working_out">Working Out</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* 2. Tabs selection */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap">
        {([
          { key: 'friends', label: `Friends (${friends.length})` },
          { key: 'requests', label: `Invites (${requests.length})` },
          { key: 'search', label: 'Search Users' },
          { key: 'feed', label: 'Social Feed' },
          { key: 'blocked', label: 'Blocked' }
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3.5 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab.key 
                ? 'border-brand-650 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-slate-450 hover:text-slate-650 dark:hover:text-slate-250'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active tab content */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeTab === 'friends' && (
            <div className="space-y-4">
              <div className="text-left font-black text-xs text-slate-400 uppercase tracking-wider mb-2">
                Established Friendships
              </div>
              
              {friends.length === 0 ? (
                <Card variant="glass" className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3 text-slate-500">group</span>
                  <p className="text-sm font-black">No friends added yet.</p>
                  <p className="text-xs mt-1 font-semibold">Head over to 'Search Users' to find other athletes.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {friends.map(f => (
                    <FriendCard
                      key={f.id}
                      friend={f}
                      onlineStatus={f.friend_id ? trackedStatuses[f.friend_id] : undefined}
                      onRemove={removeFriend}
                      onToggleFavorite={toggleFavorite}
                      onBlockUser={handleBlockAction}
                      loading={friendsLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="text-left font-black text-xs text-slate-400 uppercase tracking-wider mb-2">
                Pending Requests
              </div>
              
              {requests.length === 0 ? (
                <Card variant="glass" className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3 text-slate-500">mail</span>
                  <p className="text-sm font-black">Inbox clear.</p>
                  <p className="text-xs mt-1 font-semibold">No pending invites at the moment.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {requests.map(req => (
                    <FriendRequestCard
                      key={req.id}
                      request={req}
                      onAccept={acceptRequest}
                      onReject={rejectRequest}
                      loading={requestsLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search box inputs */}
              <Card variant="glass" className="p-5 text-left">
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-4">Enter Username or FitSync ID</h3>
                
                <div className="flex gap-3">
                  <Input
                    placeholder="e.g. alex_rivera or FTS-8X42PQ"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    leftIcon="search"
                    className="flex-1"
                  />
                  {searchInput && (
                    <Button variant="outline" size="sm" onClick={() => setSearchInput('')}>
                      Clear
                    </Button>
                  )}
                </div>

                {/* Recent search history list */}
                {recentSearches.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-2">
                      <span>Recent Searches</span>
                      <button onClick={clearHistory} className="hover:text-red-500 cursor-pointer">Clear All</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchHistoryClick(q)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-650 dark:text-slate-350 cursor-pointer transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Results list */}
              <div className="space-y-3">
                {searchInput && results.length === 0 && !searchLoading && (
                  <Card variant="glass" className="py-8 text-center text-slate-400 text-xs font-semibold">
                    No users matching "{searchInput}" found.
                  </Card>
                )}
                {results.map(user => (
                  <UserSearchCard
                    key={user.id}
                    user={user}
                    onSendRequest={handleSendInvite}
                    onBlockUser={handleBlockAction}
                    loading={searchLoading}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="text-left font-black text-xs text-slate-400 uppercase tracking-wider mb-2">
                Friends Feed Feed
              </div>

              {feed.length === 0 ? (
                <Card variant="glass" className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3 text-slate-500">feed</span>
                  <p className="text-sm font-black">Feed is quiet.</p>
                  <p className="text-xs mt-1 font-semibold">Log workouts to share progress with friends.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {feed.map(item => (
                    <ActivityCard key={item.id} activity={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="space-y-4">
              <div className="text-left font-black text-xs text-slate-400 uppercase tracking-wider mb-2">
                Blocked Profiles ({blockedList.length})
              </div>

              {blockedList.length === 0 ? (
                <Card variant="glass" className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3 text-slate-500">lock_open</span>
                  <p className="text-sm font-black">No blocked users.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {blockedList.map(user => (
                    <BlockedUserCard
                      key={user.id}
                      user={user}
                      onUnblock={unblockUser}
                      loading={blocksLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Identification cards and suggestions */}
        <div className="space-y-6">
          <Card variant="glass" className="p-6 text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">My FitSync ID</h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">Share these identifiers with friends so they can add you.</p>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 font-semibold text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="text-slate-805 dark:text-slate-200">@{profile?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">FitSync ID:</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">{profile?.fitsync_id}</span>
              </div>
            </div>
          </Card>

          {/* suggestions list */}
          {suggestions.length > 0 && (
            <Card variant="glass" className="p-5 text-left">
              <h3 className="text-xs font-black text-slate-900 dark:text-white mb-4">People You May Know</h3>
              <div className="space-y-3">
                {suggestions.map(sug => (
                  <FriendSuggestionCard
                    key={sug.id}
                    user={sug}
                    onSendRequest={handleSendInvite}
                    loading={requestsLoading}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default Social;
