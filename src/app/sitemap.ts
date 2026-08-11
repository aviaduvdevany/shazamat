import { MetadataRoute } from "next";
import { getPublicShows } from "@/lib/shows/queries";
import { getPublicAlbums } from "@/lib/albums/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shazamat.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}#shows`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}#music`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}#contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  let albumRoutes: MetadataRoute.Sitemap = [];
  let showRoutes: MetadataRoute.Sitemap = [];

  try {
    const albums = await getPublicAlbums();
    albumRoutes = albums.map((album) => ({
      url: `${baseUrl}#album-${album.id}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable during build; skip album routes
  }

  try {
    const shows = await getPublicShows();
    const futureShows = shows.filter((s) => !s.isPast);
    showRoutes = futureShows.map(() => ({
      url: `${baseUrl}#shows`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable during build; skip show routes
  }

  return [...routes, ...albumRoutes, ...showRoutes];
}
