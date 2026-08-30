"use client";

import { useState, useEffect, useCallback } from "react";
import type { Player } from "@/lib/vote/players";
import PlayerAvatar from "./PlayerAvatar";

interface Props {
  players: Player[];
}

const TOKEN_KEY = "motw_voter_token";
const VOTED_KEY = "motw_voted_for";

function getOrCreateToken(): string {
  try {
    const existing = localStorage.getItem(TOKEN_KEY);
    if (existing) return existing;
    const token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch {
    return crypto.randomUUID();
  }
}

function getVotedFor(): string | null {
  try {
    return localStorage.getItem(VOTED_KEY);
  } catch {
    return null;
  }
}

function saveVotedFor(playerId: string) {
  try {
    localStorage.setItem(VOTED_KEY, playerId);
  } catch {
    // ignore
  }
}

export default function VoteBoard({ players }: Props) {
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVotedFor(getVotedFor());
    setMounted(true);
  }, []);

  const handleVote = useCallback(
    async (playerId: string) => {
      if (votedFor || pending) return;
      setPending(playerId);
      setError(null);

      try {
        const token = getOrCreateToken();
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, voterToken: token }),
        });

        if (!res.ok) throw new Error("server");

        const data = (await res.json()) as { ok: boolean; alreadyVoted?: boolean };
        if (data.ok) {
          saveVotedFor(playerId);
          setVotedFor(playerId);
        }
      } catch {
        setError("משהו השתבש, נסה שוב");
      } finally {
        setPending(null);
      }
    },
    [votedFor, pending]
  );

  // Avoid flash of "not voted" state on first render by waiting for mount
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-[#db7738] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chosenPlayer = votedFor ? players.find((p) => p.id === votedFor) : null;

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      dir="rtl"
    >
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <p className="text-[#db7738] text-sm font-semibold uppercase tracking-widest mb-2">
          הופעה באמפי שוני
        </p>
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
          הנגן המצטיין
        </h1>
        <p className="text-white/50 text-sm mt-2">
          {votedFor ? "הצבעת!" : "בחרו את הנגן הכי שווה הערב"}
        </p>
      </div>

      {/* Voted confirmation */}
      {votedFor && chosenPlayer && (
        <div className="relative z-10 text-center animate-[fadeIn_0.5s_ease]">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <PlayerAvatar player={chosenPlayer} size={120} />
              <div className="absolute -top-3 -right-3 text-3xl">🏆</div>
            </div>
          </div>
          <p className="text-[#db7738] text-2xl font-bold mb-1">
            {chosenPlayer.name}
          </p>
          <p className="text-white/60 text-base mb-4">{chosenPlayer.role}</p>
          <div className="inline-block bg-[#db7738]/20 border border-[#db7738]/40 rounded-full px-5 py-2">
            <p className="text-white font-semibold text-lg">✅ הצבעתך נקלטה!</p>
          </div>
          <p className="text-white/30 text-xs mt-4">
            תודה שהצבעת — נראה מי מנצח בסוף 😄
          </p>
        </div>
      )}

      {/* Vote grid */}
      {!votedFor && (
        <div className="relative z-10 w-full max-w-md">
          {error && (
            <p className="text-red-400 text-center text-sm mb-4">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {players.map((player, idx) => {
              const isLast = idx === players.length - 1 && players.length % 2 !== 0;
              const isPending = pending === player.id;

              return (
                <button
                  key={player.id}
                  onClick={() => handleVote(player.id)}
                  disabled={!!pending}
                  className={[
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200",
                    "text-center active:scale-95",
                    isLast ? "col-span-2 max-w-[48%] mx-auto" : "",
                    "border-white/10 bg-white/5 hover:border-[#db7738] hover:bg-[#db7738]/10",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    isPending ? "border-[#db7738] bg-[#db7738]/10 scale-95" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`הצבע עבור ${player.name}`}
                >
                  <PlayerAvatar player={player} size={72} />
                  <div>
                    <p className="text-white font-bold text-base leading-tight">
                      {player.name}
                    </p>
                    <p className="text-[#db7738] text-xs mt-0.5">{player.role}</p>
                  </div>
                  {isPending && (
                    <div className="w-4 h-4 border-2 border-[#db7738] border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
