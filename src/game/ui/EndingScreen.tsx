"use client";

import { useState } from "react";
import type { Member } from "../schema/members";
import type { GameState } from "../schema/state";
import type { ContentPack } from "../schema/pack";

interface Props {
  member: Member;
  state: GameState;
  pack: ContentPack;
  shareUrl?: string;
  onRestart: () => void;
}

export function EndingScreen({ member, state, pack, shareUrl, onRestart }: Props) {
  const [copied, setCopied] = useState(false);

  const musicianship = state.stats.musicianship ?? 0;
  const swag = state.stats.swag ?? 0;

  async function handleShare() {
    const shareText = `חייתי חיים שלמים והפכתי ל${member.name}! 🎵\n\nמה אתה תהיה? → ${window.location.origin}${shareUrl ?? "/life"}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // Fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: open WhatsApp
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        "_blank"
      );
    }
  }

  return (
    <div className="game-ending-screen">
      <div className="game-ending-preamble">החיים שלך הסתיימו. אתה הוא...</div>

      {/* Member portrait */}
      <div
        className="game-sprite-portrait"
        style={{
          width: 120,
          height: 120,
          backgroundImage: `url(/game/members/${member.id}-portrait.png)`,
        }}
        aria-label={`פורטרט של ${member.name}`}
      />

      <div className="game-ending-member-name">{member.name}</div>
      <div className="game-ending-member-role">{member.role}</div>

      {/* Stats */}
      <div className="game-share-stats">
        {pack.stats.map((def) => (
          <div key={def.id} className="game-share-stat">
            <span className="game-share-stat-emoji">{def.emoji}</span>
            <span className="game-share-stat-value">{state.stats[def.id] ?? def.initial}</span>
            <span className="game-share-stat-label">{def.label}</span>
          </div>
        ))}
      </div>

      {/* Blurb */}
      <p className="game-ending-blurb">{member.endingBlurb}</p>

      {/* Recap */}
      {state.log.length > 0 && (
        <>
          <div className="game-ending-recap-title">החיים שלך בקצרה</div>
          <div className="game-ending-recap">
            {state.log.slice(0, 5).map((entry, i) => (
              <div key={i} className="game-ending-recap-entry">
                <span>→ {entry.choiceLabel}</span>
                {entry.outcomeLabel && ` (${entry.outcomeLabel})`}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="game-share-actions">
        <button className="game-btn game-btn-primary" onClick={handleShare}>
          {copied ? "הועתק! שתף עם חברים" : "שתף את התוצאה"}
        </button>
        <button className="game-btn game-btn-secondary" onClick={onRestart}>
          התחל חיים חדשים
        </button>
      </div>
    </div>
  );
}
