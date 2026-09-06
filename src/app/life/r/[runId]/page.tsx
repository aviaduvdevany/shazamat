import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompletedRun } from "@/lib/game/actions";
import { pack } from "@/game/content/pack";
import { ShareLanding } from "@/game/ui/ShareLanding";

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
  if (!member) {
    notFound();
  }

  const state = run.state;
  const musicianship = state?.stats?.musicianship ?? 0;
  const swag = state?.stats?.swag ?? 0;
  const log = state?.log ?? [];

  return (
    <ShareLanding
      member={{
        id: member.id,
        name: member.name,
        role: member.role,
        endingBlurb: member.endingBlurb,
      }}
      stats={{ musicianship, swag }}
      log={log}
    />
  );
}
