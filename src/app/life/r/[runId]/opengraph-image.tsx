import { ImageResponse } from "next/og";
import { getCompletedRun } from "@/lib/game/actions";
import { pack } from "@/game/content/pack";

export const alt = "שאזאמאט: החיים — תוצאת משחק";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ runId: string }>;
}

export default async function Image({ params }: Props) {
  const { runId } = await params;
  const run = await getCompletedRun(runId);

  const member = run?.memberId
    ? pack.members.find((m) => m.id === run.memberId)
    : null;

  const memberName = member?.name ?? "???";
  const memberRole = member?.role ?? "";
  const musicianship = run?.state?.stats?.musicianship ?? 0;
  const swag = run?.state?.stats?.swag ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "48px 64px",
          fontFamily: "sans-serif",
          direction: "rtl",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, color: "#DB7738", letterSpacing: 4 }}>
          שאזאמאט: החיים
        </div>

        <div style={{ display: "flex", fontSize: 38, color: "#888", fontWeight: 400 }}>
          חייתי חיים שלמים והפכתי ל...
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 100,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {memberName}
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#DB7738", fontWeight: 700 }}>
          {memberRole}
        </div>

        <div style={{ display: "flex", gap: 40, marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "#111",
              border: "2px solid #333",
              padding: "12px 28px",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 28 }}>🎸</span>
            <span style={{ color: "#fff", fontSize: 36, fontWeight: 900 }}>
              {musicianship}
            </span>
            <span style={{ color: "#888", fontSize: 18 }}>מוזיקליות</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "#111",
              border: "2px solid #333",
              padding: "12px 28px",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 28 }}>😎</span>
            <span style={{ color: "#fff", fontSize: 36, fontWeight: 900 }}>
              {swag}
            </span>
            <span style={{ color: "#888", fontSize: 18 }}>סוואג</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#555", marginTop: 8 }}>
          מה אתה תהיה? → shazamat.com/life
        </div>
      </div>
    ),
    { ...size }
  );
}
