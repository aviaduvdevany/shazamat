import type { Metadata } from "next";
import { GameShell } from "@/game/ui/GameShell";

export const metadata: Metadata = {
  title: "שאזאמאט: החיים | משחק",
  alternates: {
    canonical: "/life",
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: "שאזאמאט: החיים",
      description:
        "סימולטור חיים בעברית — חיה חיים שלמים כמוזיקאי ישראלי וגלה לאיזה חבר בשאזאמאט הפכת.",
      url: "https://shazamat.com/life",
      inLanguage: "he",
      numberOfPlayers: { "@type": "QuantitativeValue", minValue: 1, maxValue: 1 },
      gamePlatform: "Web browser",
      genre: ["Life simulation", "Interactive fiction"],
      publisher: { "@type": "MusicGroup", name: "Shazamat" },
    }),
  },
};

export default function LifePage() {
  return <GameShell />;
}
