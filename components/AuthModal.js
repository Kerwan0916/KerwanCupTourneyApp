'use client';

import React, { useState } from 'react';
import { resolveSupabaseClient } from '@/lib/storage';
import { ShieldCheck, Mail, Lock, UserCheck, LogOut, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthStateChange,
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const client = resolveSupabaseClient();

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!client) {
      setErrorMsg('Supabase is not configured yet. Add your Supabase credentials in Cloud Settings first.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Account created! If email confirmation is enabled, check your inbox to confirm.');
        if (data?.user) {
          onAuthStateChange(data.user);
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccessMsg('Signed in successfully as Host!');
        if (data?.user) {
          onAuthStateChange(data.user);
          setTimeout(() => onClose(), 800);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!client) return;
    setLoading(true);
    try {
      await client.auth.signOut();
      onAuthStateChange(null);
      setSuccessMsg('Signed out. Public spectator view active.');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              {currentUser ? 'Host Account' : isSignUp ? 'Create Host Account' : 'Host / Co-host Login'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {currentUser ? (
          /* Signed In State */
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Authenticated Host
                </p>
                <p className="text-sm font-semibold text-white">{currentUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              You are signed in with Host permissions. You can advance brackets, enter match scores, award MMR, and manage tournaments.
            </p>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-red-400 font-bold py-2.5 px-4 rounded-xl border border-slate-700 hover:border-red-500/40 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Login / Sign Up Form */
          <form onSubmit={handleAuth} className="space-y-4">
            <p className="text-xs text-slate-400">
              {isSignUp
                ? 'Create a host or co-host login to manage live tournament brackets.'
                : 'Sign in to unlock host controls. Public spectators have read-only access.'}
            </p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400">
                {successMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="cohost@kerwancup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create Host Account' : 'Sign In as Host'}</span>
            </button>

            <div className="text-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? Sign in here'
                  : "Need an account for your co-host? Create one here"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
