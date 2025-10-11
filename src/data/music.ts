import type { Album } from "@/types";

/**
 * Music Releases Data
 * Update this file to add new albums or modify existing ones
 */
export const albums: Album[] = [
  {
    id: 1,
    title: "האלבום הראשון",
    year: "2024",
  },
  {
    id: 2,
    title: "הופעה חיה",
    year: "2023",
    subtitle: "LIVE",
  },
  {
    id: 3,
    title: "סינגלים ו-EP",
    year: "2023-2024",
    subtitle: "EP",
  },
];

/**
 * Streaming Platform Names
 */
export const streamingPlatforms = [
  "Spotify",
  "Apple Music",
  "YouTube",
  "Soundcloud",
] as const;
