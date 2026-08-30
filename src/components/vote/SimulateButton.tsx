"use client";

import { useState, useRef } from "react";
import { PLAYERS } from "@/lib/vote/players";

const VOTE_COUNT = 1500;
// Stay within browser connection limits — send in parallel waves
const CONCURRENCY = 50;

interface Stats {
  sent: number;
  ok: number;
  failed: number;
  durationMs: number | null;
}

export default function SimulateButton() {
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSimulate() {
    setRunning(true);
    setStats(null);

    const abort = new AbortController();
    abortRef.current = abort;

    const t0 = performance.now();
    let ok = 0;
    let failed = 0;

    const votes = Array.from({ length: VOTE_COUNT }, () => ({
      playerId: PLAYERS[Math.floor(Math.random() * PLAYERS.length)].id,
      voterToken: crypto.randomUUID(),
    }));

    // Process in waves of CONCURRENCY to avoid saturating the browser's
    // connection pool while still genuinely stressing the server
    for (let i = 0; i < votes.length; i += CONCURRENCY) {
      if (abort.signal.aborted) break;
      const wave = votes.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        wave.map((v) =>
          fetch("/api/vote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(v),
            signal: abort.signal,
          }).then((r) => (r.ok ? "ok" : "fail"))
        )
      );

      for (const r of results) {
        if (r.status === "fulfilled" && r.value === "ok") ok++;
        else failed++;
      }

      // Update progress live
      setStats({ sent: i + wave.length, ok, failed, durationMs: null });
    }

    const durationMs = Math.round(performance.now() - t0);
    setStats({ sent: VOTE_COUNT, ok, failed, durationMs });
    setRunning(false);
  }

  function handleAbort() {
    abortRef.current?.abort();
    setRunning(false);
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-1.5 max-w-xs">
      <span className="text-yellow-400/60 text-xs font-mono uppercase tracking-widest">
        🧪 dev only — remove before show
      </span>

      <div className="flex gap-2">
        <button
          onClick={handleSimulate}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-400/40 bg-yellow-400/10 text-yellow-300 text-sm font-semibold hover:bg-yellow-400/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running && (
            <span className="w-3.5 h-3.5 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
          )}
          {running ? "שולח..." : "🎲 סימולציה — 1500 בקשות אמיתיות"}
        </button>

        {running && (
          <button
            onClick={handleAbort}
            className="px-3 py-2 rounded-lg border border-red-400/40 bg-red-400/10 text-red-300 text-sm font-semibold hover:bg-red-400/20 transition-colors"
          >
            עצור
          </button>
        )}
      </div>

      {stats && (
        <div className="bg-black/80 border border-yellow-400/20 rounded-lg px-4 py-2.5 text-xs font-mono space-y-0.5 w-full">
          <div className="flex justify-between text-yellow-300/80">
            <span>נשלחו</span>
            <span>{stats.sent} / {VOTE_COUNT}</span>
          </div>
          {stats.sent > 0 && (
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-[width] duration-300"
                style={{ width: `${(stats.sent / VOTE_COUNT) * 100}%` }}
              />
            </div>
          )}
          <div className="flex justify-between text-green-400/80">
            <span>הצלחות</span>
            <span>{stats.ok}</span>
          </div>
          <div className="flex justify-between text-red-400/80">
            <span>כשלונות</span>
            <span>{stats.failed}</span>
          </div>
          {stats.durationMs !== null && (
            <div className="flex justify-between text-white/40 pt-0.5 border-t border-white/10">
              <span>זמן כולל</span>
              <span>{(stats.durationMs / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
