// Calculate global leaderboard and MMR breakdown across all tournaments

export function calculateLeaderboard(tournaments = [], customPoints = {}) {
  const standings = {};

  const ensureTeam = (name) => {
    if (!standings[name]) {
      standings[name] = {
        name,
        totalMMR: 0,
        titles: 0,
        tournamentsPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        breakdownByTournament: {},
        breakdownByMode: {},
      };
    }
  };

  tournaments.forEach((tourney) => {
    const rules = tourney.mmrRules || {
      firstPlace: 100,
      secondPlace: 60,
      thirdPlace: 40,
      fourthPlace: 20,
      perMatchWin: 10,
    };

    const participatingTeams = new Set(tourney.teams || []);

    // Also collect any teams that appeared in matches
    (tourney.rounds || []).forEach((round) => {
      (round.matches || []).forEach((m) => {
        if (m.team1) participatingTeams.add(m.team1);
        if (m.team2) participatingTeams.add(m.team2);
      });
    });

    participatingTeams.forEach((team) => {
      ensureTeam(team);
      standings[team].tournamentsPlayed += 1;
      if (!standings[team].breakdownByTournament[tourney.id]) {
        standings[team].breakdownByTournament[tourney.id] = {
          name: tourney.name,
          mode: tourney.mode,
          points: 0,
        };
      }
      if (!standings[team].breakdownByMode[tourney.mode]) {
        standings[team].breakdownByMode[tourney.mode] = 0;
      }
    });

    // Award match win points
    (tourney.rounds || []).forEach((round) => {
      (round.matches || []).forEach((match) => {
        if (match.completed && match.winner) {
          ensureTeam(match.winner);
          standings[match.winner].matchesWon += 1;
          const winPoints = rules.perMatchWin || 0;
          standings[match.winner].totalMMR += winPoints;
          standings[match.winner].breakdownByTournament[tourney.id].points += winPoints;
          standings[match.winner].breakdownByMode[tourney.mode] =
            (standings[match.winner].breakdownByMode[tourney.mode] || 0) + winPoints;

          const loser = match.winner === match.team1 ? match.team2 : match.team1;
          if (loser) {
            ensureTeam(loser);
            standings[loser].matchesLost += 1;
          }
        }
      });
    });

    // Award tournament placement points
    if (tourney.champion) {
      ensureTeam(tourney.champion);
      standings[tourney.champion].titles += 1;
      const champPts = rules.firstPlace || 0;
      standings[tourney.champion].totalMMR += champPts;
      standings[tourney.champion].breakdownByTournament[tourney.id].points += champPts;
      standings[tourney.champion].breakdownByMode[tourney.mode] =
        (standings[tourney.champion].breakdownByMode[tourney.mode] || 0) + champPts;
    }

    if (tourney.runnerUp) {
      ensureTeam(tourney.runnerUp);
      const runnerPts = rules.secondPlace || 0;
      standings[tourney.runnerUp].totalMMR += runnerPts;
      standings[tourney.runnerUp].breakdownByTournament[tourney.id].points += runnerPts;
      standings[tourney.runnerUp].breakdownByMode[tourney.mode] =
        (standings[tourney.runnerUp].breakdownByMode[tourney.mode] || 0) + runnerPts;
    }

    if (tourney.thirdPlace) {
      ensureTeam(tourney.thirdPlace);
      const thirdPts = rules.thirdPlace || 0;
      standings[tourney.thirdPlace].totalMMR += thirdPts;
      standings[tourney.thirdPlace].breakdownByTournament[tourney.id].points += thirdPts;
      standings[tourney.thirdPlace].breakdownByMode[tourney.mode] =
        (standings[tourney.thirdPlace].breakdownByMode[tourney.mode] || 0) + thirdPts;
    }

    if (tourney.fourthPlace) {
      ensureTeam(tourney.fourthPlace);
      const fourthPts = rules.fourthPlace || 0;
      standings[tourney.fourthPlace].totalMMR += fourthPts;
      standings[tourney.fourthPlace].breakdownByTournament[tourney.id].points += fourthPts;
      standings[tourney.fourthPlace].breakdownByMode[tourney.mode] =
        (standings[tourney.fourthPlace].breakdownByMode[tourney.mode] || 0) + fourthPts;
    }
  });

  // Apply custom manual point adjustments
  Object.entries(customPoints || {}).forEach(([team, pts]) => {
    ensureTeam(team);
    standings[team].totalMMR += Number(pts) || 0;
  });

  // Convert to sorted array
  return Object.values(standings).sort((a, b) => {
    if (b.totalMMR !== a.totalMMR) return b.totalMMR - a.totalMMR;
    if (b.titles !== a.titles) return b.titles - a.titles;
    return b.matchesWon - a.matchesWon;
  });
}
