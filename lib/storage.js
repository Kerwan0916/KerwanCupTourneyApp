import { INITIAL_DATA } from './types';
import { supabase as envSupabase, getSupabaseClient } from './supabase';

const STORAGE_KEY = 'kerwan_cup_tournament_data';
const SUPABASE_CONFIG_KEY = 'kerwan_cup_supabase_config';
const ROW_ID = 'kerwan_cup_main';

export function getLocalData() {
  if (typeof window === 'undefined') return INITIAL_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local data', err);
  }
  return INITIAL_DATA;
}

export function saveLocalData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save local data', err);
  }
}

export function getStoredSupabaseConfig() {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load Supabase config', err);
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export function saveStoredSupabaseConfig(config) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save Supabase config', err);
  }
}

export function resolveSupabaseClient() {
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    return getSupabaseClient(config.url, config.anonKey);
  }
  return envSupabase;
}

// Fetch tournament data from Supabase or fallback
export async function fetchRemoteData() {
  const client = resolveSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('tournament_state')
        .select('data')
        .eq('id', ROW_ID)
        .single();

      if (!error && data && data.data && data.data.tournaments) {
        saveLocalData(data.data);
        return data.data;
      }
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }

  // Fallback to internal API route
  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.tournaments) {
        saveLocalData(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Internal API sync error:', err.message);
  }

  return getLocalData();
}

// Push tournament data to Supabase and fallback
export async function pushRemoteData(data) {
  const payload = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  saveLocalData(payload);

  const client = resolveSupabaseClient();
  if (client) {
    try {
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      const { error } = await client
        .from('tournament_state')
        .upsert({
          id: ROW_ID,
          data: payload,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        });

      if (error) {
        console.warn('Supabase upsert warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase push error:', err.message);
    }
  }

  // Also push to internal API route
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('API sync warning:', err);
  }

  return payload;
}

// Subscribe to real-time changes via Supabase Realtime WebSocket
export function subscribeToRealtimeUpdates(onUpdate) {
  const client = resolveSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('public:tournament_state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_state', filter: `id=eq.${ROW_ID}` },
        (payload) => {
          if (payload.new && payload.new.data && payload.new.data.tournaments) {
            saveLocalData(payload.new.data);
            onUpdate(payload.new.data);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✓ Connected to Supabase Realtime updates!');
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Failed to subscribe to realtime:', err);
    return null;
  }
}
