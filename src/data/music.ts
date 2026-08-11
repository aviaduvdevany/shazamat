import type { Album } from "@/types";

/**
 * Music Releases Data — LEGACY (used by StructuredData only; live music page reads from DB)
 * Update the admin CMS at /admin/albums to change what appears on the public site.
 */
export const albums: Album[] = [
  {
    id: 1,
    title: "רכב מפורק",
    year: "2019",
    coverImage: "/albums/meforak.webp",
    spotify: "https://open.spotify.com/album/5WUS43UuuehWYoLOX9heC9?si=6JMYSeB9Q5CA_BW36XF5rg",
    appleMusic:
      "https://music.apple.com/us/album/%D7%A8%D7%9B%D7%91-%D7%9E%D7%A4%D7%95%D7%A8%D7%A7/1476168266",
  },
  {
    id: 5,
    title: "בוא נרגע",
    year: "2020",
    coverImage: "/albums/bo-niraga.webp",
    spotify: "https://open.spotify.com/album/6zNSwYpIMKhNniauqjyvff?si=Tq-HPHNiS-Kay5QdnAfGBw",
    appleMusic:
      "https://music.apple.com/us/album/%D7%91%D7%95%D7%90-%D7%A0%D7%A8%D7%92%D7%A2-ep/1516248526",
  },
  {
    id: 2,
    title: "התעוררנו מאוחר",
    year: "2021",
    coverImage: "/albums/hitorarnu.webp",
    spotify: "https://open.spotify.com/album/4gg0XdG6VEdRF4pU8A5v0m?si=_ysFtkbbQkuhageNrIY6pw",
    appleMusic:
      "https://music.apple.com/us/album/%D7%94%D7%AA%D7%A2%D7%95%D7%A8%D7%A8%D7%A0%D7%95-%D7%9E%D7%90%D7%95%D7%97%D7%A8/1589796540",
  },
  {
    id: 3,
    title: "שיחת ליטופים",
    year: "2023",
    coverImage: "/albums/litufim.webp",
    spotify: "https://open.spotify.com/album/5EtQOPAR4r7x4I3giAIc4T?si=hDuPGSr_SR-0BaBzYPUcYQ",
    appleMusic:
      "https://music.apple.com/us/album/%D7%A9%D7%99%D7%97%D7%AA-%D7%9C%D7%99%D7%98%D7%95%D7%A4%D7%99%D7%9D/1696871404",
  },
  {
    id: 4,
    title: "תופס אוויר",
    year: "2024",
    coverImage: "/albums/tofes.webp",
    spotify: "https://open.spotify.com/album/4aTFfglGrFqWRQGVXqwCAQ?si=FkSGK8DjQJCdf9Gnzu8j_w",
    appleMusic:
      "https://music.apple.com/us/album/%D7%AA%D7%95%D7%A4%D7%A1-%D7%90%D7%95%D7%95%D7%99%D7%A8/1776450989",
  },
];

/**
 * Streaming Platform Names
 */
export const streamingPlatforms = ["Spotify", "Apple Music"] as const;
