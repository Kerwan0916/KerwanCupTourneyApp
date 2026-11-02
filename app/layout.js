import "./globals.css";

export const metadata = {
  title: "Kerwan Cup - Tournament Hub & MMR Standings",
  description: "Live tournament brackets, match scoring, and cumulative MMR leaderboard for custom tournaments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
