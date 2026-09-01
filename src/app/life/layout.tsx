import type { Metadata } from "next";
import "./game.css";

export const metadata: Metadata = {
  title: "שאזאמאט: החיים | משחק",
  description:
    "חיה חיים שלמים כמוזיקאי ישראלי וגלה לאיזה חבר בשאזאמאט הפכת. משחק חינמי בעברית.",
  keywords: [
    "משחק שאזאמאט",
    "איזה חבר בלהקה אתה",
    "סימולטור חיים עברי",
    "שאזאמאט",
    "משחק מוזיקה ישראלי",
  ],
  openGraph: {
    type: "website",
    locale: "he_IL",
    title: "שאזאמאט: החיים",
    description: "חיה חיים שלמים כמוזיקאי ישראלי וגלה לאיזה חבר בשאזאמאט הפכת.",
    images: [
      {
        url: "/life/opengraph-image",
        width: 1200,
        height: 630,
        alt: "שאזאמאט: החיים — סימולטור חיים",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "שאזאמאט: החיים",
    description: "חיה חיים שלמים כמוזיקאי ישראלי וגלה לאיזה חבר בשאזאמאט הפכת.",
  },
};

export default function LifeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
