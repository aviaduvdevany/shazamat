import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompletedRun } from "@/lib/game/actions";
import { pack } from "@/game/content/pack";

interface Props {
  params: Promise<{ runId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { runId } = await params;
  const run = await getCompletedRun(runId);

  if (!run || !run.memberId) {
    return { title: "שאזאמאט: החיים | משחק" };
  }

  const member = pack.members.find((m) => m.id === run.memberId);
  const memberName = member?.name ?? run.memberId;

  return {
    title: `הפכתי ל${memberName} | שאזאמאט: החיים`,
    description: `חייתי חיים שלמים והפכתי ל${memberName}. מה אתה תהיה?`,
    alternates: {
      canonical: "/life",
    },
    openGraph: {
      title: `הפכתי ל${memberName} — שאזאמאט: החיים`,
      description: `חייתי חיים שלמים והפכתי ל${memberName}. מה אתה תהיה?`,
      images: [
        {
          url: `/life/r/${runId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `הפכתי ל${memberName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `הפכתי ל${memberName} — שאזאמאט: החיים`,
      description: `חייתי חיים שלמים והפכתי ל${memberName}. מה אתה תהיה?`,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { runId } = await params;
  const run = await getCompletedRun(runId);

  if (!run || !run.memberId) {
    notFound();
  }

  const member = pack.members.find((m) => m.id === run.memberId);
  const state = run.state;
  const musicianship = state?.stats?.musicianship ?? 0;
  const swag = state?.stats?.swag ?? 0;

  const log = state?.log ?? [];

  return (
    <div className="game-share-page">
      <div className="game-share-card">
        <div className="game-share-band-label">שאזאמאט</div>

        <div className="game-share-reveal">
          <div className="game-share-you-are">אתה הוא</div>
          <div className="game-share-member-name">{member?.name ?? run.memberId}</div>
          <div className="game-share-member-role">{member?.role}</div>
        </div>

        <div className="game-share-portrait">
          {/* Placeholder — real portrait replaces this */}
          <div
            className="game-sprite-portrait"
            style={{
              backgroundImage: `url(/game/members/${run.memberId}-portrait.png)`,
            }}
          />
        </div>

        <div className="game-share-stats">
          <div className="game-share-stat">
            <span className="game-share-stat-emoji">🎸</span>
            <span className="game-share-stat-label">מוזיקליות</span>
            <span className="game-share-stat-value">{musicianship}</span>
          </div>
          <div className="game-share-stat">
            <span className="game-share-stat-emoji">😎</span>
            <span className="game-share-stat-label">סוואג</span>
            <span className="game-share-stat-value">{swag}</span>
          </div>
        </div>

        {member?.endingBlurb && (
          <p className="game-share-blurb">{member.endingBlurb}</p>
        )}

        {log.length > 0 && (
          <div className="game-share-log">
            <div className="game-share-log-title">החיים שלך בקצרה:</div>
            {log.slice(0, 4).map((entry, i) => (
              <div key={i} className="game-share-log-entry">
                <span className="game-share-log-choice">→ {entry.choiceLabel}</span>
                {entry.outcomeLabel && (
                  <span className="game-share-log-outcome"> ({entry.outcomeLabel})</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="game-share-actions">
          <Link href="/life" className="game-btn game-btn-primary">
            התחל חיים חדשים
          </Link>
        </div>
      </div>
    </div>
  );
}
