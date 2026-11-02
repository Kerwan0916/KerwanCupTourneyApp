'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Swords, Calendar, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { DEFAULT_MMR_RULES } from '@/lib/types';

export default function TournamentsView({
  tournaments = [],
  onCreateTournament,
  onDeleteTournament,
  onSelectTournament,
  isAdmin = true,
}) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [mode, setMode] = useState("Summoner's Rift 5v5");
  const [format, setFormat] = useState('single_elimination_4');
  const [teamsText, setTeamsText] = useState('Team Alpha, Team Bravo, Team Charlie, Team Delta');
  const [firstPlacePts, setFirstPlacePts] = useState(100);
  const [secondPlacePts, setSecondPlacePts] = useState(60);
  const [matchWinPts, setMatchWinPts] = useState(10);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const teamList = teamsText
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Build rounds for single elimination 4 or 8
    let rounds = [];
    if (format === 'single_elimination_4') {
      const t1 = teamList[0] || 'Team 1';
      const t2 = teamList[1] || 'Team 2';
      const t3 = teamList[2] || 'Team 3';
      const t4 = teamList[3] || 'Team 4';

      rounds = [
        {
          id: 'r1',
          name: 'Semifinals',
          matches: [
            { id: 'm1', round: 1, team1: t1, team2: t2, score1: 0, score2: 0, winner: null, completed: false },
            { id: 'm2', round: 1, team1: t3, team2: t4, score1: 0, score2: 0, winner: null, completed: false },
          ],
        },
        {
          id: 'r2',
          name: 'Grand Finals',
          matches: [
            { id: 'm3', round: 2, team1: null, team2: null, score1: 0, score2: 0, winner: null, completed: false },
          ],
        },
      ];
    } else {
      // 8 teams single elimination
      const seeds = Array.from({ length: 8 }, (_, i) => teamList[i] || `Team ${i + 1}`);
      rounds = [
        {
          id: 'r1',
          name: 'Quarterfinals',
          matches: [
            { id: 'm1', round: 1, team1: seeds[0], team2: seeds[1], score1: 0, score2: 0, winner: null, completed: false },
            { id: 'm2', round: 1, team1: seeds[2], team2: seeds[3], score1: 0, score2: 0, winner: null, completed: false },
            { id: 'm3', round: 1, team1: seeds[4], team2: seeds[5], score1: 0, score2: 0, winner: null, completed: false },
            { id: 'm4', round: 1, team1: seeds[6], team2: seeds[7], score1: 0, score2: 0, winner: null, completed: false },
          ],
        },
        {
          id: 'r2',
          name: 'Semifinals',
          matches: [
            { id: 'm5', round: 2, team1: null, team2: null, score1: 0, score2: 0, winner: null, completed: false },
            { id: 'm6', round: 2, team1: null, team2: null, score1: 0, score2: 0, winner: null, completed: false },
          ],
        },
        {
          id: 'r3',
          name: 'Grand Finals',
          matches: [
            { id: 'm7', round: 3, team1: null, team2: null, score1: 0, score2: 0, winner: null, completed: false },
          ],
        },
      ];
    }

    const newTourney = {
      id: `tourney-${Date.now()}`,
      name: name.trim(),
      mode,
      status: 'in_progress',
      date: new Date().toISOString().split('T')[0],
      format,
      teams: teamList,
      rounds,
      mmrRules: {
        ...DEFAULT_MMR_RULES,
        firstPlace: Number(firstPlacePts) || 100,
        secondPlace: Number(secondPlacePts) || 60,
        perMatchWin: Number(matchWinPts) || 10,
      },
      champion: null,
      runnerUp: null,
    };

    onCreateTournament(newTourney);
    setShowModal(false);
    setName('');
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Tournament Manager
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">All Organized Tournaments</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create custom tournaments, configure brackets, and award distinct MMR points.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 self-stretch md:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        )}
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tourney) => (
          <div
            key={tourney.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  {tourney.mode}
                </span>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    tourney.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : tourney.status === 'in_progress'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tourney.status === 'completed' ? 'Finished' : tourney.status === 'in_progress' ? 'Live' : 'Upcoming'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {tourney.name}
              </h3>

              <div className="text-xs text-slate-400 space-y-1 mb-4">
                <p>Teams: {tourney.teams?.length || 0} teams registered</p>
                <p>Date: {tourney.date}</p>
                {tourney.champion && (
                  <p className="text-yellow-400 font-semibold flex items-center gap-1">
                    🏆 Champion: {tourney.champion}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectTournament(tourney.id)}
                className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>View Bracket</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm(`Delete tournament "${tourney.name}"?`)) {
                      onDeleteTournament(tourney.id);
                    }
                  }}
                  className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                  title="Delete Tournament"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Tournament Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-400" />
                <span>New Custom Tournament</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tournament Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kerwan Cup #4 - Winter Invitational"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Game Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Summoner's Rift 5v5">Summoner's Rift 5v5</option>
                    <option value="ARAM 5v5">ARAM 5v5</option>
                    <option value="1v1 Duel">1v1 Howling Abyss Duel</option>
                    <option value="Custom Mode">Custom Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bracket Size
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="single_elimination_4">4 Teams (Semifinals + Finals)</option>
                    <option value="single_elimination_8">8 Teams (Quarterfinals + Semis + Finals)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Team Names (separated by comma or new lines)
                </label>
                <textarea
                  rows="3"
                  value={teamsText}
                  onChange={(e) => setTeamsText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Team 1, Team 2, Team 3, Team 4"
                />
              </div>

              {/* Point Rules */}
              <div className="border-t border-slate-800 pt-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  MMR Point Awards
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400">1st Place</label>
                    <input
                      type="number"
                      value={firstPlacePts}
                      onChange={(e) => setFirstPlacePts(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">2nd Place</label>
                    <input
                      type="number"
                      value={secondPlacePts}
                      onChange={(e) => setSecondPlacePts(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">Per Match Win</label>
                    <input
                      type="number"
                      value={matchWinPts}
                      onChange={(e) => setMatchWinPts(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  Generate Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
