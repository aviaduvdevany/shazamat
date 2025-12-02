import type { Album } from "@/types";

/**
 * Music Releases Data
 * Update this file to add new albums or modify existing ones
 */
export const albums: Album[] = [
  {
    id: 1,
    title: "רכב מפורק",
    year: "2019",
    coverImage: "/albums/meforak.jpeg",
    spotify: "https://open.spotify.com/album/00000000000000000000000000000000",
    appleMusic:
      "https://music.apple.com/album/00000000000000000000000000000000",
  },
  {
    id: 5,
    title: "בוא נרגע",
    year: "2020",
    coverImage: "/albums/bo-niraga.jpg",
    spotify: "https://open.spotify.com/album/00000000000000000000000000000000",
    appleMusic:
      "https://music.apple.com/album/00000000000000000000000000000000",
  },
  {
    id: 2,
    title: "התעוררנו מאוחר",
    year: "2021",
    coverImage: "/albums/hitorarnu.jpeg",
    spotify: "https://open.spotify.com/album/00000000000000000000000000000000",
    appleMusic:
      "https://music.apple.com/album/00000000000000000000000000000000",
  },
  {
    id: 3,
    title: "שיחת ליטופים",
    year: "2023",
    coverImage: "/albums/litufim.jpg",
    spotify: "https://open.spotify.com/album/00000000000000000000000000000000",
    appleMusic:
      "https://music.apple.com/album/00000000000000000000000000000000",
  },
  {
    id: 4,
    title: "תופס אוויר",
    year: "2024",
    coverImage: "/albums/tofes.jpg",
    spotify: "https://open.spotify.com/album/00000000000000000000000000000000",
    appleMusic:
      "https://music.apple.com/album/00000000000000000000000000000000",
  },
];

/**
 * Streaming Platform Names
 */
export const streamingPlatforms = ["Spotify", "Apple Music"] as const;
