// Default MMR point distribution for tournaments
export const DEFAULT_MMR_RULES = {
  firstPlace: 100,
  secondPlace: 60,
  thirdPlace: 40,
  fourthPlace: 20,
  perMatchWin: 10,
};

export const INITIAL_DATA = {
  tournaments: [
    {
      id: "tourney-1",
      name: "Kerwan Cup #1 - Summoner's Rift 5v5",
      mode: "Summoner's Rift 5v5",
      status: "completed",
      date: "2026-10-15",
      format: "single_elimination_4",
      mmrRules: { ...DEFAULT_MMR_RULES },
      teams: ["Hextech Heroes", "Baron Stealers", "Nexus Blitzers", "Dragon Slayers"],
      rounds: [
        {
          id: "r1",
          name: "Semifinals",
          matches: [
            {
              id: "m1",
              round: 1,
              team1: "Hextech Heroes",
              team2: "Baron Stealers",
              score1: 2,
              score2: 1,
              winner: "Hextech Heroes",
              completed: true,
            },
            {
              id: "m2",
              round: 1,
              team1: "Nexus Blitzers",
              team2: "Dragon Slayers",
              score1: 0,
              score2: 2,
              winner: "Dragon Slayers",
              completed: true,
            },
          ],
        },
        {
          id: "r2",
          name: "Grand Finals",
          matches: [
            {
              id: "m3",
              round: 2,
              team1: "Hextech Heroes",
              team2: "Dragon Slayers",
              score1: 2,
              score2: 0,
              winner: "Hextech Heroes",
              completed: true,
            },
          ],
        },
      ],
      champion: "Hextech Heroes",
      runnerUp: "Dragon Slayers",
      thirdPlace: "Baron Stealers",
      fourthPlace: "Nexus Blitzers",
    },
    {
      id: "tourney-2",
      name: "Kerwan Cup #2 - ARAM 5v5 Brawl",
      mode: "ARAM 5v5",
      status: "in_progress",
      date: "2026-11-02",
      format: "single_elimination_4",
      mmrRules: { ...DEFAULT_MMR_RULES },
      teams: ["Hextech Heroes", "Poro Snax", "Baron Stealers", "Snowball Express"],
      rounds: [
        {
          id: "r1",
          name: "Semifinals",
          matches: [
            {
              id: "m1",
              round: 1,
              team1: "Hextech Heroes",
              team2: "Poro Snax",
              score1: 1,
              score2: 2,
              winner: "Poro Snax",
              completed: true,
            },
            {
              id: "m2",
              round: 1,
              team1: "Baron Stealers",
              team2: "Snowball Express",
              score1: 2,
              score2: 1,
              winner: "Baron Stealers",
              completed: true,
            },
          ],
        },
        {
          id: "r2",
          name: "Grand Finals",
          matches: [
            {
              id: "m3",
              round: 2,
              team1: "Poro Snax",
              team2: "Baron Stealers",
              score1: 1,
              score2: 1,
              winner: null,
              completed: false,
            },
          ],
        },
      ],
      champion: null,
      runnerUp: null,
    },
    {
      id: "tourney-3",
      name: "Kerwan Cup #3 - 1v1 Howling Abyss Duel",
      mode: "1v1 Duel",
      status: "upcoming",
      date: "2026-11-15",
      format: "single_elimination_4",
      mmrRules: { ...DEFAULT_MMR_RULES },
      teams: ["Faker Jr", "Zed Main", "Yasuo 0/10", "Darius King"],
      rounds: [
        {
          id: "r1",
          name: "Semifinals",
          matches: [
            {
              id: "m1",
              round: 1,
              team1: "Faker Jr",
              team2: "Zed Main",
              score1: 0,
              score2: 0,
              winner: null,
              completed: false,
            },
            {
              id: "m2",
              round: 1,
              team1: "Yasuo 0/10",
              team2: "Darius King",
              score1: 0,
              score2: 0,
              winner: null,
              completed: false,
            },
          ],
        },
        {
          id: "r2",
          name: "Grand Finals",
          matches: [
            {
              id: "m3",
              round: 2,
              team1: null,
              team2: null,
              score1: 0,
              score2: 0,
              winner: null,
              completed: false,
            },
          ],
        },
      ],
      champion: null,
      runnerUp: null,
    },
  ],
  customPoints: {}, // optional manual adjustments { "Team Name": 50 }
  cloudConfig: {
    firebaseUrl: "", // optional Firebase Realtime DB URL e.g. https://my-tourney-default-rtdb.firebaseio.com/
    syncKey: "kerwan-cup-v1",
  },
  lastUpdated: new Date().toISOString(),
};
