from flask import Flask, jsonify, request, render_template_string
import json
import os

app = Flask(__name__)
DATA_FILE = 'tournament_mmr.json'

# Initialize database if it doesn't exist
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({"teams": {}}, f)

def load_data():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(load_data())

@app.route('/api/data', methods=['POST'])
def update_data():
    new_data = request.json
    data = load_data()
    
    team = new_data['team']
    if team not in data['teams']:
        data['teams'][team] = {"sr": 0, "aram": 0, "1v1": 0, "total": 0}
        
    mode = new_data['mode']
    points = int(new_data['points'])
    
    data['teams'][team][mode] += points
    data['teams'][team]['total'] = data['teams'][team]['sr'] + data['teams'][team]['aram'] + data['teams'][team]['1v1']
    
    save_data(data)
    return jsonify(data)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Montreal LoL Tournament MMR</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-gray-100 p-8 font-sans">
    <div class="max-w-5xl mx-auto">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-blue-400">Global MMR Standings</h1>
            <button id="sync-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow font-mono transition-colors">
                🔄 Resync (05:00)
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Add Points Form -->
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                <h2 class="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Record Match Result</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Team Name</label>
                        <input type="text" id="team-name" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" placeholder="e.g., Team Hextech">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Tournament Mode</label>
                        <select id="mode-select" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                            <option value="sr">Summoner's Rift 5v5</option>
                            <option value="aram">ARAM 5v5</option>
                            <option value="1v1">Howling Abyss 1v1</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">MMR Points Awarded</label>
                        <input type="number" id="mmr-points" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" placeholder="100">
                    </div>
                    <button onclick="submitPoints()" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded mt-4">
                        Add Points
                    </button>
                </div>
            </div>

            <!-- Standings Table -->
            <div class="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-gray-700 text-gray-400">
                            <th class="p-3">Rank</th>
                            <th class="p-3">Team</th>
                            <th class="p-3 text-right">SR 5v5</th>
                            <th class="p-3 text-right">ARAM</th>
                            <th class="p-3 text-right">1v1s</th>
                            <th class="p-3 text-right font-bold text-yellow-400">Total MMR</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard">
                        <!-- Populated by JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        const SYNC_INTERVAL_MS = 300000; // 5 minutes
        let timeRemaining = SYNC_INTERVAL_MS / 1000;
        let countdownTimer;

        function startCountdown() {
            clearInterval(countdownTimer);
            timeRemaining = SYNC_INTERVAL_MS / 1000;
            
            countdownTimer = setInterval(() => {
                timeRemaining--;
                const mins = Math.floor(timeRemaining / 60);
                const secs = String(timeRemaining % 60).padStart(2, '0');
                document.getElementById('sync-btn').innerText = `🔄 Resync (${mins}:${secs})`;
                
                if (timeRemaining <= 0) {
                    fetchData();
                }
            }, 1000);
        }

        async function fetchData() {
            const btn = document.getElementById('sync-btn');
            btn.innerText = "🔄 Syncing...";
            
            try {
                const response = await fetch('/api/data');
                const data = await response.json();
                renderTable(data.teams);
            } catch (err) {
                console.error("Failed to sync:", err);
            }
            
            startCountdown();
        }

        async function submitPoints() {
            const team = document.getElementById('team-name').value.trim();
            const mode = document.getElementById('mode-select').value;
            const points = document.getElementById('mmr-points').value;

            if (!team || !points) return alert("Fill out team name and points.");

            await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team, mode, points })
            });

            document.getElementById('mmr-points').value = '';
            fetchData();
        }

        function renderTable(teamsData) {
            const tbody = document.getElementById('leaderboard');
            tbody.innerHTML = '';

            // Convert object to array and sort by total MMR descending
            const teams = Object.entries(teamsData).map(([name, stats]) => ({ name, ...stats }));
            teams.sort((a, b) => b.total - a.total);

            teams.forEach((team, index) => {
                const row = document.createElement('tr');
                row.className = "border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors";
                row.innerHTML = `
                    <td class="p-3 text-gray-400 font-bold">${index + 1}</td>
                    <td class="p-3 font-semibold text-white">${team.name}</td>
                    <td class="p-3 text-right text-blue-300">${team.sr}</td>
                    <td class="p-3 text-right text-purple-300">${team.aram}</td>
                    <td class="p-3 text-right text-red-300">${team['1v1']}</td>
                    <td class="p-3 text-right font-bold text-yellow-400 text-lg">${team.total}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Manual sync on click
        document.getElementById('sync-btn').addEventListener('click', fetchData);

        // Initial load
        fetchData();
    </script>
</body>
</html>
"""

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)