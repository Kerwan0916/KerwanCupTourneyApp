# 🏆 Kerwan Cup - Tournament Hub & Cumulative MMR

A modern, cloud-synced tournament management web application built for organizing custom brackets (Summoner's Rift 5v5, ARAM, 1v1 Duels) with real-time Supabase sync, built-in host authentication, and cross-tournament cumulative MMR standings.

---

## ✨ Features

- **⚡ Instant Real-Time WebSocket Sync (Supabase)**:
  - Whenever you or your co-host updates a score or advances a winner, both screens update **instantaneously**.
  - Includes a fallback 5-minute auto-resync countdown button (`🔄 Resync (04:59)`) that you can click at any time.
- **🔐 Host & Co-Host Authentication**:
  - **Host / Admin**: Sign in with email & password to manage brackets, edit scores, and award MMR.
  - **Public Spectators / Stream Viewers**: Anyone visiting `kerwancup.com` gets a clean read-only view with zero editing capability.
- **⚔️ Interactive Custom Brackets**:
  - Supports 4-team and 8-team single elimination brackets (Quarterfinals, Semifinals, Grand Finals).
  - Live score editing (`2 - 1`, `1 - 0`).
  - One-click winner advancement through rounds.
  - Automatic champion crowning banner with gold trophy visuals.
- **📊 Global Cumulative MMR Standings**:
  - Aggregates team & player points across every tournament you organize.
  - Detailed breakdown by tournament and game mode (SR 5v5, ARAM 5v5, 1v1s).
  - Quick manual MMR adjuster for sportsmanship bonuses or penalties.
- **💾 Backup & Restore**: Export all tournaments and MMR data to JSON or import anytime.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open your browser
http://localhost:3000
```

---

## ⚡ Supabase Setup (2 Minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, go to **SQL Editor**, paste the contents of [`supabase_schema.sql`](file:///Users/kevin/Desktop/Drive/personalProjects/KerwanCupTourneyApp/supabase_schema.sql), and click **Run**.
   - This sets up the `tournament_state` table, enables real-time WebSockets, and configures Row Level Security (public read, host-only write).
3. Go to **Project Settings > API**, and copy:
   - **Project URL**
   - **Project API keys (anon / public)**
4. In the app:
   - Click the **Settings (⚙️)** icon in the top bar and paste your URL & Key.
   - Or add them to a `.env.local` file:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
5. Click **Host Login** in the top bar to create your host account and invite your co-host!

---

## 🌐 Deploying to Vercel (Free)

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: Supabase real-time tournament hub with auth"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your `KerwanCupTourneyApp` repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Your app will be live with free HTTPS and real-time syncing!

---

## 🏷️ Adding a Custom Domain on Vercel

1. Buy your domain (e.g., `kerwancup.com`) from Cloudflare, Namecheap, or Porkbun (~$10/year).
2. In your Vercel Project Dashboard, go to **Settings > Domains**.
3. Type your domain name (e.g., `kerwancup.com`) and click **Add**.
4. In your domain provider's DNS management, add the DNS records Vercel shows (usually an `A` record pointing to `76.76.21.21` or a `CNAME` pointing to `cname.vercel-dns.com`).
5. Vercel automatically generates and renews free SSL/HTTPS certificates.
