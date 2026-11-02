'use client';

import React from 'react';
import { Trophy, Swords, BarChart3, RefreshCw, Settings, ShieldCheck, Eye, User, Lock, Radio } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  timeRemaining,
  isSyncing,
  lastSynced,
  onManualSync,
  isAdmin,
  setIsAdmin,
  currentUser,
  onOpenAuth,
  onOpenSettings,
  isRealtimeConnected,
}) {
  const mins = Math.floor(timeRemaining / 60);
  const secs = String(timeRemaining % 60).padStart(2, '0');

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                  KERWAN CUP
                </span>
                {isRealtimeConnected ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Sync
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Tourney Hub
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Tournament Brackets & Cumulative MMR
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('brackets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'brackets'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Brackets</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Global MMR</span>
            </button>

            <button
              onClick={() => setActiveTab('tournaments')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'tournaments'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Tournaments</span>
            </button>
          </nav>

          {/* Right Action Bar (5-min Sync Timer + Host Auth + Settings) */}
          <div className="flex items-center gap-2.5">
            
            {/* The 5-Minute Resync Button */}
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              title="Click to manually resync now and reset the 5-minute countdown"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-sm ${
                isSyncing
                  ? 'bg-slate-800 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>{isSyncing ? 'Syncing...' : `Resync (${mins}:${secs})`}</span>
            </button>

            {/* Host Auth Button */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                currentUser
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
              title={currentUser ? `Signed in as ${currentUser.email}` : "Sign in as Host or Co-host"}
            >
              {currentUser ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-bold">Host</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Host Login</span>
                </>
              )}
            </button>

            {/* Supabase Cloud Settings Modal Trigger */}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                isRealtimeConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
              }`}
              title={isRealtimeConnected ? "Supabase Real-time Sync Active" : "Supabase Cloud Settings"}
            >
              <div className="relative">
                <Settings className="w-4 h-4" />
                {isRealtimeConnected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
                )}
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
