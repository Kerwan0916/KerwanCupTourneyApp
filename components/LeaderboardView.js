'use client';

import React, { useState } from 'react';
import { calculateLeaderboard } from '@/lib/mmrCalculator';
import { Trophy, Award, Search, Plus, Flame, Shield, ArrowUpRight } from 'lucide-react';

export default function LeaderboardView({
  tournaments = [],
  customPoints = {},
  onUpdateCustomPoints,
  isAdmin = true,
}) {
  const [search, setSearch] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [newPoints, setNewPoints] = useState('');

  const leaderboard = calculateLeaderboard(tournaments, customPoints);

  const filtered = leaderboard.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddManualPoints = (e) => {
    e.preventDefault();
    if (!newTeam.trim() || !newPoints) return;
    const current = customPoints[newTeam.trim()] || 0;
    const updated = {
      ...customPoints,
      [newTeam.trim()]: current + (parseInt(newPoints, 10) || 0),
    };
    onUpdateCustomPoints(updated);
    setNewTeam('');
    setNewPoints('');
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20">
              Cumulative MMR
            </span>
            <span className="text-xs text-slate-400">
              Across all {tournaments.length} tournaments
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Global Master Standings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Points are automatically aggregated from tournament placements, match wins, and bonus points.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Standings Table (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <th className="p-3">Rank</th>
                <th className="p-3">Team / Player</th>
                <th className="p-3 text-center">Titles</th>
                <th className="p-3 text-center">Record</th>
                <th className="p-3 text-right">SR 5v5</th>
                <th className="p-3 text-right">ARAM</th>
                <th className="p-3 text-right">1v1s</th>
                <th className="p-3 text-right font-black text-yellow-400">Total MMR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No teams found.
                  </td>
                </tr>
              ) : (
                filtered.map((team, idx) => {
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const isThird = idx === 2;

                  return (
                    <tr
                      key={team.name}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isFirst ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-mono font-bold">
                          {isFirst ? (
                            <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs border border-yellow-500/30">
                              🥇
                            </span>
                          ) : isSecond ? (
                            <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center text-xs border border-slate-400/30">
                              🥈
                            </span>
                          ) : isThird ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 flex items-center justify-center text-xs border border-amber-700/30">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-500 text-sm px-1.5">#{idx + 1}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{team.name}</span>
                          {team.titles > 0 && (
                            <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              🏆 {team.titles}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center text-xs text-slate-400 font-mono">
                        {team.titles}
                      </td>

                      <td className="p-3 text-center text-xs text-slate-400 font-mono">
                        <span className="text-emerald-400">{team.matchesWon}W</span>
                        <span className="mx-1 text-slate-600">-</span>
                        <span className="text-red-400">{team.matchesLost}L</span>
                      </td>

                      <td className="p-3 text-right text-sm font-mono text-blue-300">
                        {team.breakdownByMode["Summoner's Rift 5v5"] || 0}
                      </td>

                      <td className="p-3 text-right text-sm font-mono text-purple-300">
                        {team.breakdownByMode["ARAM 5v5"] || 0}
                      </td>

                      <td className="p-3 text-right text-sm font-mono text-red-300">
                        {team.breakdownByMode["1v1 Duel"] || 0}
                      </td>

                      <td className="p-3 text-right font-black font-mono text-lg text-yellow-400">
                        {team.totalMMR}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right Sidebar: Quick MMR Adjuster (Matches user's original functionality) */}
        <div className="space-y-6">
          {isAdmin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white">Manual MMR Adjustment</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Instantly award or penalize MMR points for any team (e.g. sportsmanship bonus, penalties, or custom exhibition matches).
              </p>

              <form onSubmit={handleAddManualPoints} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Hextech Heroes"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Points (+/-)
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Award MMR</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              <Shield className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">Spectator Mode active. Switch to Host Mode in the top bar to record points or edit tournaments.</p>
            </div>
          )}

          {/* Point Distribution Legend */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3">
              Standard Point Formula
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between">
                <span>🏆 1st Place (Champion)</span>
                <span className="font-mono font-bold text-yellow-400">+100 MMR</span>
              </li>
              <li className="flex justify-between">
                <span>🥈 2nd Place (Runner-up)</span>
                <span className="font-mono font-bold text-slate-300">+60 MMR</span>
              </li>
              <li className="flex justify-between">
                <span>🥉 3rd / 4th Place</span>
                <span className="font-mono font-bold text-amber-500">+30 MMR</span>
              </li>
              <li className="flex justify-between">
                <span>⚔️ Each Match Won</span>
                <span className="font-mono font-bold text-blue-400">+10 MMR</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
