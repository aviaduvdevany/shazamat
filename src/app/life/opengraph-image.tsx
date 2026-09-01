import { ImageResponse } from "next/og";

export const alt = "שאזאמאט: החיים — סימולטור חיים";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          gap: 24,
          padding: 64,
          fontFamily: "sans-serif",
          direction: "rtl",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#DB7738", letterSpacing: 4 }}>
          שאזאמאט
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 900,
            color: "#fff",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          החיים
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#aaa", textAlign: "center", maxWidth: 700 }}>
          חיה חיים שלמים כמוזיקאי ישראלי — וגלה לאיזה חבר בשאזאמאט הפכת
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            padding: "14px 40px",
            background: "#DB7738",
            color: "#000",
            fontWeight: 900,
            fontSize: 26,
            borderRadius: 8,
          }}
        >
          התחל חיים →
        </div>
      </div>
    ),
    { ...size }
  );
}
