'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import BracketView from '@/components/BracketView';
import LeaderboardView from '@/components/LeaderboardView';
import TournamentsView from '@/components/TournamentsView';
import CloudSettingsModal from '@/components/CloudSettingsModal';
import AuthModal from '@/components/AuthModal';
import { INITIAL_DATA } from '@/lib/types';
import {
  getLocalData,
  saveLocalData,
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  resolveSupabaseClient,
  fetchRemoteData,
  pushRemoteData,
  subscribeToRealtimeUpdates,
} from '@/lib/storage';

const SYNC_INTERVAL_SECONDS = 300; // 5 minutes

export default function Home() {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTourneyId, setActiveTourneyId] = useState('tourney-2');
  const [activeTab, setActiveTab] = useState('brackets');
  
  // Auth & Permissions
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true); // Defaults to true in dev, auto-locked in production if user not logged in
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfigState] = useState({ url: '', anonKey: '' });

  // Sync state
  const [timeRemaining, setTimeRemaining] = useState(SYNC_INTERVAL_SECONDS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const countdownRef = useRef(null);

  // Sync with Supabase / remote
  const performSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const remote = await fetchRemoteData();
      if (remote && remote.tournaments) {
        setData(remote);
        setLastSynced(new Date());
      }
    } catch (err) {
      console.warn('Sync attempt failed, retaining local state:', err);
    } finally {
      setIsSyncing(false);
      setTimeRemaining(SYNC_INTERVAL_SECONDS);
    }
  }, []);

  // Handle manual resync click
  const handleManualSync = () => {
    performSync();
  };

  // Initial load & Supabase Auth check
  useEffect(() => {
    const local = getLocalData();
    setData(local);
    const config = getStoredSupabaseConfig();
    setSupabaseConfigState(config);

    // Initial fetch from remote
    performSync();

    // Check Supabase session
    const client = resolveSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data: sessionData }) => {
        const user = sessionData?.session?.user || null;
        setCurrentUser(user);
        if (user) {
          setIsAdmin(true);
        }
      });

      const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
        const user = session?.user || null;
        setCurrentUser(user);
        if (user) {
          setIsAdmin(true);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, [performSync]);

  // Subscribe to live Realtime WebSocket updates from Supabase
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeUpdates((updatedData) => {
      console.log('⚡ Live update received from Supabase Realtime!');
      setData(updatedData);
      setLastSynced(new Date());
      setIsRealtimeConnected(true);
    });

    if (unsubscribe) {
      setIsRealtimeConnected(true);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [supabaseConfig]);

  // 5-minute countdown timer
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          performSync();
          return SYNC_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current);
  }, [performSync]);

  // Update a tournament
  const handleUpdateTournament = (updatedTourney) => {
    const updatedTournaments = data.tournaments.map((t) =>
      t.id === updatedTourney.id ? updatedTourney : t
    );
    const newData = { ...data, tournaments: updatedTournaments };
    setData(newData);
    pushRemoteData(newData);
  };

  // Create a new tournament
  const handleCreateTournament = (newTourney) => {
    const updatedTournaments = [newTourney, ...data.tournaments];
    const newData = { ...data, tournaments: updatedTournaments };
    setData(newData);
    setActiveTourneyId(newTourney.id);
    setActiveTab('brackets');
    pushRemoteData(newData);
  };

  // Delete a tournament
  const handleDeleteTournament = (tourneyId) => {
    const updatedTournaments = data.tournaments.filter((t) => t.id !== tourneyId);
    const newData = { ...data, tournaments: updatedTournaments };
    setData(newData);
    if (activeTourneyId === tourneyId && updatedTournaments.length > 0) {
      setActiveTourneyId(updatedTournaments[0].id);
    }
    pushRemoteData(newData);
  };

  // Update manual custom MMR points
  const handleUpdateCustomPoints = (updatedPoints) => {
    const newData = { ...data, customPoints: updatedPoints };
    setData(newData);
    pushRemoteData(newData);
  };

  // Save Supabase configuration
  const handleSaveSupabaseConfig = (newConfig) => {
    setSupabaseConfigState(newConfig);
    saveStoredSupabaseConfig(newConfig);
    performSync();
  };

  // Export data as JSON file
  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kerwan_cup_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data from JSON
  const handleImportData = (importedData) => {
    if (importedData && importedData.tournaments) {
      setData(importedData);
      pushRemoteData(importedData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Navigation Bar with 5-minute Resync Button & Host Auth */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        timeRemaining={timeRemaining}
        isSyncing={isSyncing}
        lastSynced={lastSynced}
        onManualSync={handleManualSync}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'brackets' && (
          <BracketView
            tournaments={data.tournaments}
            activeTourneyId={activeTourneyId}
            setActiveTourneyId={setActiveTourneyId}
            onUpdateTournament={handleUpdateTournament}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            tournaments={data.tournaments}
            customPoints={data.customPoints}
            onUpdateCustomPoints={handleUpdateCustomPoints}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'tournaments' && (
          <TournamentsView
            tournaments={data.tournaments}
            onCreateTournament={handleCreateTournament}
            onDeleteTournament={handleDeleteTournament}
            onSelectTournament={(id) => {
              setActiveTourneyId(id);
              setActiveTab('brackets');
            }}
            isAdmin={isAdmin}
          />
        )}

      </main>

      {/* Supabase Cloud Settings Modal */}
      <CloudSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        supabaseConfig={supabaseConfig}
        onSaveSupabaseConfig={handleSaveSupabaseConfig}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Host Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onAuthStateChange={(user) => {
          setCurrentUser(user);
          setIsAdmin(Boolean(user));
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>Kerwan Cup Tournament Hub • Supabase Real-time Sync & Cumulative MMR System</p>
      </footer>

    </div>
  );
}
