'use client';

import React, { useState } from 'react';
import { Database, Check, ExternalLink, Download, Upload, Shield, Key, Copy } from 'lucide-react';

export default function CloudSettingsModal({
  isOpen,
  onClose,
  supabaseConfig,
  onSaveSupabaseConfig,
  onExportData,
  onImportData,
}) {
  const [url, setUrl] = useState(supabaseConfig?.url || '');
  const [key, setKey] = useState(supabaseConfig?.anonKey || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSupabaseConfig({ url: url.trim(), anonKey: key.trim() });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImportData(parsed);
        alert('Tournament data imported successfully!');
        onClose();
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Supabase Cloud & Real-time Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-300 leading-relaxed">
            <p className="font-semibold mb-1">⚡ Instant Real-time WebSocket Sync + Auth:</p>
            <p>
              By linking your free Supabase project, you get <strong>instant live updates</strong> when you or your co-host updates scores, plus secure authentication so only you two can edit while public spectators can view.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project-id.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Found in Supabase: Project Settings → API → Project URL.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Found in Supabase: Project Settings → API → Project API keys (anon / public).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 font-bold">
                {savedNotice && '✓ Credentials saved! Real-time sync active.'}
              </span>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
              >
                Save Supabase Config
              </button>
            </div>
          </form>

          {/* Setup Guide Link */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300">
            <p className="font-semibold text-slate-200 mb-1">📋 Database Setup (1 Minute):</p>
            <p className="text-slate-400 mb-2">
              Run the provided <code className="text-emerald-400">supabase_schema.sql</code> script in your Supabase SQL Editor to create the table and real-time permissions.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Backup & Restore Data */}
          <div className="border-t border-slate-800 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Backup & Transfer Data
            </label>
            <div className="flex gap-3">
              <button
                onClick={onExportData}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export JSON</span>
              </button>

              <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
