"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VoteResults, PlayerResult } from "@/lib/vote/queries";
import PlayerAvatar from "./PlayerAvatar";

const POLL_INTERVAL_MS = 1500;

interface Props {
  initialResults: VoteResults;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = usePrevious(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prev === undefined || prev === value) {
      setDisplay(value);
      return;
    }
    const start = prev;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, prev]);

  return <span>{display}</span>;
}

export default function LiveResultsBoard({ initialResults }: Props) {
  const [results, setResults] = useState<VoteResults>(initialResults);
  const [pulse, setPulse] = useState(false);
  const prevTotal = usePrevious(results.totalVotes);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch("/api/vote/results", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as VoteResults;
      setResults(data);
    } catch {
      // silently ignore — will retry next tick
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchResults, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchResults]);

  // Pulse the total counter when votes come in
  useEffect(() => {
    if (prevTotal !== undefined && results.totalVotes > prevTotal) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [results.totalVotes, prevTotal]);

  const maxVotes = Math.max(...results.players.map((p) => p.votes), 1);
  const leaderId =
    results.totalVotes > 0
      ? results.players.reduce((a, b) => (a.votes >= b.votes ? a : b)).id
      : null;

  return (
    <div
      className="min-h-screen bg-black flex flex-col px-12 py-10 relative overflow-hidden"
      dir="rtl"
    >
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />

      {/* Top strip: title + total */}
      <div className="relative z-10 flex items-end justify-between mb-10">
        <div>
          <p className="text-[#db7738] text-xl font-semibold uppercase tracking-widest mb-1">
            אמפי שוני
          </p>
          <h1 className="text-white font-bold leading-none" style={{ fontSize: "clamp(56px, 7vw, 96px)" }}>
            הנגן המצטיין
          </h1>
        </div>
        <div className="text-left ltr text-right">
          <p className="text-white/40 text-lg mb-1">סה&quot;כ הצבעות</p>
          <p
            className={[
              "font-bold text-[#db7738] transition-all duration-300",
              pulse ? "scale-110 drop-shadow-[0_0_16px_rgba(219,119,56,0.9)]" : "",
            ].join(" ")}
            style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
          >
            <AnimatedNumber value={results.totalVotes} />
          </p>
        </div>
      </div>

      {/* Bars */}
      <div className="relative z-10 flex flex-col gap-6 flex-1 justify-center">
        {results.players.map((player) => {
          const isLeader = player.id === leaderId;
          const pct =
            results.totalVotes === 0 ? 0 : (player.votes / maxVotes) * 100;
          const votePct =
            results.totalVotes === 0
              ? 0
              : Math.round((player.votes / results.totalVotes) * 100);

          return (
            <PlayerRow
              key={player.id}
              player={player}
              pct={pct}
              votePct={votePct}
              isLeader={isLeader}
            />
          );
        })}
      </div>

      {/* Footer pulse dot (live indicator) */}
      <div className="relative z-10 flex items-center gap-2 mt-8 justify-end">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#db7738] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#db7738]" />
        </span>
        <span className="text-white/30 text-sm">שידור חי</span>
      </div>
    </div>
  );
}

interface PlayerRowProps {
  player: PlayerResult;
  pct: number;
  votePct: number;
  isLeader: boolean;
}

function PlayerRow({ player, pct, votePct, isLeader }: PlayerRowProps) {
  return (
    <div
      className={[
        "flex items-center gap-6 group",
        isLeader ? "opacity-100" : "opacity-80",
      ].join(" ")}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <PlayerAvatar player={player} size={72} />
        {isLeader && (
          <div className="absolute -top-4 -right-2 text-3xl animate-bounce">
            👑
          </div>
        )}
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className={[
              "font-bold leading-none",
              isLeader ? "text-[#db7738]" : "text-white",
            ].join(" ")}
            style={{ fontSize: "clamp(22px, 2.8vw, 40px)" }}
          >
            {player.name}
          </span>
          <span className="text-white/40 text-lg shrink-0">{player.role}</span>
        </div>

        {/* Progress bar track */}
        <div className="relative h-10 rounded-full bg-white/10 overflow-hidden">
          <div
            className={[
              "h-full rounded-full transition-[width] duration-700 ease-out",
              isLeader
                ? "bg-[#db7738] shadow-[0_0_24px_rgba(219,119,56,0.6)]"
                : "bg-white/30",
            ].join(" ")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Vote count + % */}
      <div className="shrink-0 text-right min-w-[120px]">
        <p
          className={[
            "font-bold leading-none",
            isLeader ? "text-[#db7738]" : "text-white",
          ].join(" ")}
          style={{ fontSize: "clamp(28px, 3.5vw, 52px)" }}
        >
          <AnimatedNumber value={player.votes} />
        </p>
        <p className="text-white/40 text-lg mt-1">{votePct}%</p>
      </div>
    </div>
  );
}
