import type { SocialPlatform } from "@/types";

/**
 * Social Media Platforms
 * Update URLs when social media accounts are created
 */
export const socialPlatforms: SocialPlatform[] = [
  { name: "Facebook", icon: "/icons/Facebook_f_logo.svg", url: "https://www.facebook.com/MuluRecords" },
  { name: "Instagram", icon: "/icons/Instagram_logo.svg", url: "https://www.instagram.com/shazamat_crew" },
  { name: "YouTube", icon: "/icons/youtube_logo.png", url: "https://www.youtube.com/@Shazamat" },
  { name: "TikTok", icon: "/icons/Tiktok_icon.svg", url: "https://www.tiktok.com/@_shazamat_" },
];

/**
 * Canonical entity URLs for JSON-LD sameAs.
 * Aligned with Wikidata Q113584465 and Wikipedia.
 * Separate from socialPlatforms (which is UI-only).
 */
export const entitySameAs: string[] = [
  "https://he.wikipedia.org/wiki/%D7%A9%D7%90%D7%96%D7%90%D7%9E%D7%90%D7%98",
  "https://open.spotify.com/artist/0uo5SLiIan9YDCQWy20wyV",
  "https://musicbrainz.org/artist/ceacd77f-84f8-48a0-a3b9-1dd462784d75",
  "https://www.instagram.com/shazamat_crew",
  "https://www.youtube.com/@Shazamat",
  "https://www.tiktok.com/@_shazamat_",
  "https://www.facebook.com/MuluRecords",
];
