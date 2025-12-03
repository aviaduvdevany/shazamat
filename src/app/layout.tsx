import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shazamat.com";
const siteName = "שאזאמאט - Shazamat";
const description =
  "שאזאמאט - להקת היפ-הופ ישראלית. מוזיקה, הופעות, אלבומים. האזן למוזיקה החדשה שלנו ב-Spotify ו-Apple Music.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "שאזאמאט",
    "Shazamat",
    "היפ הופ ישראלי",
    "מוזיקה ישראלית",
    "להקת היפ הופ",
    "ראפ ישראלי",
    "מוזיקה עברית",
    "הופעות",
    "אלבומים",
    "Spotify",
    "Apple Music",
  ],
  authors: [{ name: "Shazamat" }],
  creator: "Shazamat",
  publisher: "Shazamat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: siteUrl,
    siteName,
    title: siteName,
    description,
    images: [
      {
        url: "/images/hero-image.webp",
        width: 1200,
        height: 630,
        alt: "שאזאמאט - Shazamat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: ["/images/hero-image.webp"],
    creator: "@shazamat_crew",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: siteUrl,
  },
  other: {
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
