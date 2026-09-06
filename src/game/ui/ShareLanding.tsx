"use client";

import Link from "next/link";
import type { LogEntry } from "../schema/state";
import { LifeRecap } from "./LifeRecap";
import { pack } from "../content/pack";

interface Props {
  member: {
    id: string;
    name: string;
    role: string;
    endingBlurb?: string;
  };
  stats: { musicianship: number; swag: number };
  log: LogEntry[];
}

/**
 * UX-6: Share landing — a faster cover of the ending show.
 * CSS-only stagger, no JS beat machine:
 *   t=0   band (fade)
 *   t=80  "אתה הוא" (fade)
 *   t=160 name (slam, --g-t-base)
 *   t=360 portrait + role + stats (fade)
 *   t=500 dare "מה אתה תהיה?" (fade)
 *   t=600 CTA (fade)
 * Recap collapsed by default via native <details>.
 * UX-7: Recap uses LifeRecap stage-dot strip.
 */
export function ShareLanding({ member, stats, log }: Props) {
  return (
    <div className="game-share-page">
      <div className="game-share-card">
        {/* t=0: band */}
        <div className="game-share-band-label game-sl-band">שאזאמאט</div>

        {/* t=80: "אתה הוא" */}
        <div className="game-share-you-are game-sl-you-are">אתה הוא</div>

        {/* t=160: name slam (--g-t-base, overshoot) */}
        <div className="game-share-member-name game-sl-name">{member.name}</div>

        {/* t=360: portrait */}
        <div
          className="game-sprite-portrait game-sl-reveal"
          style={{
            width: 96,
            height: 96,
            backgroundImage: `url(/game/members/${member.id}-portrait.png)`,
          }}
          role="img"
          aria-label={`פורטרט של ${member.name}`}
        />

        {/* t=360: role */}
        <div className="game-share-member-role game-sl-reveal">{member.role}</div>

        {/* t=360: stats */}
        <div className="game-share-stats game-sl-reveal">
          <div className="game-share-stat">
            <span className="game-share-stat-emoji">🎸</span>
            <span className="game-share-stat-value">{stats.musicianship}</span>
            <span className="game-share-stat-label">מוזיקליות</span>
          </div>
          <div className="game-share-stat">
            <span className="game-share-stat-emoji">😎</span>
            <span className="game-share-stat-value">{stats.swag}</span>
            <span className="game-share-stat-label">סוואג</span>
          </div>
        </div>

        {/* t=360: blurb (identity color stays, friend sees it before the dare) */}
        {member.endingBlurb && (
          <p className="game-share-blurb game-sl-reveal">{member.endingBlurb}</p>
        )}

        {/* t=360: recap — collapsed so the friend reaches the CTA without scrolling.
              UX-7: now uses LifeRecap stage-dot strip (static, no animation). */}
        {log.length > 0 && (
          <details className="game-share-recap-details game-sl-reveal">
            <summary className="game-share-recap-summary">החיים שלהם בקצרה ▸</summary>
            <div className="game-share-log">
              <LifeRecap log={log} stages={pack.stages} />
            </div>
          </details>
        )}

        {/* t=500: dare */}
        <p className="game-share-dare game-sl-dare">מה אתה תהיה?</p>

        {/* t=600: CTA */}
        <div className="game-share-actions game-sl-cta">
          <Link href="/life" className="game-btn game-btn-primary">
            התחל חיים
          </Link>
        </div>
      </div>
    </div>
  );
}
