'use client';

import React, { useState } from 'react';
import { Trophy, Swords, Crown, Check, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';

export default function BracketView({
  tournaments = [],
  activeTourneyId,
  setActiveTourneyId,
  onUpdateTournament,
  isAdmin = true,
}) {
  const currentTourney = tournaments.find((t) => t.id === activeTourneyId) || tournaments[0];
  const [editingScoreId, setEditingScoreId] = useState(null);

  if (!currentTourney) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-300">No Tournaments Found</h3>
        <p className="text-sm text-slate-500">Create a tournament in the Tournaments tab to build a bracket.</p>
      </div>
    );
  }

  // Handle setting match winner & advancing to next round
  const handleSelectWinner = (roundIndex, matchIndex, winningTeam) => {
    if (!isAdmin) return;

    const updated = JSON.parse(JSON.stringify(currentTourney));
    const round = updated.rounds[roundIndex];
    const match = round.matches[matchIndex];

    if (!match.team1 || !match.team2) return;

    match.winner = winningTeam;
    match.completed = true;

    // Advance to next round if available
    const nextRoundIndex = roundIndex + 1;
    if (nextRoundIndex < updated.rounds.length) {
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const isFirstSlot = matchIndex % 2 === 0;
      const nextMatch = updated.rounds[nextRoundIndex].matches[nextMatchIndex];

      if (nextMatch) {
        if (isFirstSlot) {
          nextMatch.team1 = winningTeam;
        } else {
          nextMatch.team2 = winningTeam;
        }
      }
    } else {
      // This was the Grand Finals! Set champion & runner-up
      updated.champion = winningTeam;
      updated.runnerUp = winningTeam === match.team1 ? match.team2 : match.team1;
      updated.status = 'completed';
    }

    onUpdateTournament(updated);
  };

  // Handle updating match score
  const handleScoreChange = (roundIndex, matchIndex, s1, s2) => {
    if (!isAdmin) return;
    const updated = JSON.parse(JSON.stringify(currentTourney));
    const match = updated.rounds[roundIndex].matches[matchIndex];
    match.score1 = parseInt(s1, 10) || 0;
    match.score2 = parseInt(s2, 10) || 0;
    onUpdateTournament(updated);
  };

  // Reset a match
  const handleResetMatch = (roundIndex, matchIndex) => {
    if (!isAdmin) return;
    const updated = JSON.parse(JSON.stringify(currentTourney));
    const match = updated.rounds[roundIndex].matches[matchIndex];
    const prevWinner = match.winner;
    match.winner = null;
    match.completed = false;
    match.score1 = 0;
    match.score2 = 0;

    // Also clear from subsequent rounds if advanced
    const nextRoundIndex = roundIndex + 1;
    if (nextRoundIndex < updated.rounds.length && prevWinner) {
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const nextMatch = updated.rounds[nextRoundIndex]?.matches[nextMatchIndex];
      if (nextMatch) {
        if (nextMatch.team1 === prevWinner) nextMatch.team1 = null;
        if (nextMatch.team2 === prevWinner) nextMatch.team2 = null;
        nextMatch.winner = null;
        nextMatch.completed = false;
      }
    }

    if (updated.champion === prevWinner) {
      updated.champion = null;
      updated.runnerUp = null;
      updated.status = 'in_progress';
    }

    onUpdateTournament(updated);
  };

  return (
    <div className="space-y-8">
      
      {/* Tournament Selector Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              {currentTourney.mode}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                currentTourney.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : currentTourney.status === 'in_progress'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {currentTourney.status === 'completed' ? 'Finished' : currentTourney.status === 'in_progress' ? 'Live Now' : 'Upcoming'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{currentTourney.name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Date: {currentTourney.date} • Format: {currentTourney.rounds?.length || 0} Rounds • 1st Place: +{currentTourney.mmrRules?.firstPlace || 100} MMR
          </p>
        </div>

        {/* Tournament Switcher */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <label className="text-xs font-medium text-slate-400">Switch Tournament:</label>
          <select
            value={currentTourney.id}
            onChange={(e) => setActiveTourneyId(e.target.value)}
            className="bg-slate-800 text-white text-sm font-semibold border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Champion Banner (Displays if Champion is Crowned) */}
      {currentTourney.champion && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-yellow-500/40 rounded-2xl p-6 shadow-2xl text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-yellow-500/30 ring-4 ring-yellow-400/20">
              <Crown className="w-8 h-8 text-slate-950 fill-slate-950" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-400">
              Tournament Champion
            </span>
            <h3 className="text-3xl font-black text-white tracking-wide">
              {currentTourney.champion}
            </h3>
            <p className="text-xs text-yellow-200/80 max-w-md">
              Awarded +{currentTourney.mmrRules?.firstPlace || 100} MMR towards the Master Standings!
            </p>
          </div>
        </div>
      )}

      {/* Bracket Tree Layout */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[700px] flex items-center justify-start gap-12 px-4">
          
          {(currentTourney.rounds || []).map((round, rIndex) => (
            <div key={round.id || rIndex} className="flex-1 flex flex-col justify-around min-w-[260px] space-y-8">
              
              {/* Round Header */}
              <div className="text-center pb-2 border-b border-slate-800">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  {round.name || `Round ${rIndex + 1}`}
                </span>
              </div>

              {/* Matches in Round */}
              <div className="space-y-6">
                {(round.matches || []).map((match, mIndex) => {
                  const isTeam1Winner = match.winner && match.winner === match.team1;
                  const isTeam2Winner = match.winner && match.winner === match.team2;

                  return (
                    <div
                      key={match.id || mIndex}
                      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-slate-700"
                    >
                      {/* Match Header */}
                      <div className="bg-slate-950/60 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Match {mIndex + 1}</span>
                        {match.completed && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>

                      {/* Team 1 Slot */}
                      <div
                        className={`flex items-center justify-between p-3 border-b border-slate-800/50 transition-colors ${
                          isTeam1Winner ? 'bg-emerald-500/10 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isTeam1Winner && <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                          <span
                            className={`text-sm truncate ${
                              match.team1 ? (isTeam1Winner ? 'text-emerald-300' : 'text-white') : 'text-slate-500 italic'
                            }`}
                          >
                            {match.team1 || 'TBD'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isAdmin ? (
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={match.score1 ?? 0}
                              onChange={(e) =>
                                handleScoreChange(rIndex, mIndex, e.target.value, match.score2)
                              }
                              className="w-10 bg-slate-800 border border-slate-700 text-center text-sm font-bold rounded py-0.5 text-white focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span className="font-mono font-bold text-sm text-slate-300 px-2">
                              {match.score1 ?? 0}
                            </span>
                          )}

                          {isAdmin && match.team1 && match.team2 && (
                            <button
                              onClick={() => handleSelectWinner(rIndex, mIndex, match.team1)}
                              title="Set as Match Winner"
                              className={`p-1 rounded text-xs transition-colors ${
                                isTeam1Winner
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Team 2 Slot */}
                      <div
                        className={`flex items-center justify-between p-3 transition-colors ${
                          isTeam2Winner ? 'bg-emerald-500/10 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isTeam2Winner && <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                          <span
                            className={`text-sm truncate ${
                              match.team2 ? (isTeam2Winner ? 'text-emerald-300' : 'text-white') : 'text-slate-500 italic'
                            }`}
                          >
                            {match.team2 || 'TBD'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isAdmin ? (
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={match.score2 ?? 0}
                              onChange={(e) =>
                                handleScoreChange(rIndex, mIndex, match.score1, e.target.value)
                              }
                              className="w-10 bg-slate-800 border border-slate-700 text-center text-sm font-bold rounded py-0.5 text-white focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span className="font-mono font-bold text-sm text-slate-300 px-2">
                              {match.score2 ?? 0}
                            </span>
                          )}

                          {isAdmin && match.team1 && match.team2 && (
                            <button
                              onClick={() => handleSelectWinner(rIndex, mIndex, match.team2)}
                              title="Set as Match Winner"
                              className={`p-1 rounded text-xs transition-colors ${
                                isTeam2Winner
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reset Match Button (Host Only) */}
                      {isAdmin && match.completed && (
                        <div className="bg-slate-950/80 px-3 py-1 flex justify-end border-t border-slate-800/60">
                          <button
                            onClick={() => handleResetMatch(rIndex, mIndex)}
                            className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset Match
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
