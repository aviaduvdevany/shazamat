import { MetadataRoute } from "next";
import { albums } from "@/data/music";
import { upcomingShows } from "@/data/shows";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shazamat.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;

  // Main pages
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

  // Album pages
  const albumRoutes = albums.map((album) => ({
    url: `${baseUrl}#album-${album.id}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  // Show pages (only future shows)
  const showRoutes = upcomingShows
    .filter((show) => {
      const showDate = new Date(show.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return showDate >= today;
    })
    .map((show) => ({
      url: `${baseUrl}#shows`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...routes, ...albumRoutes, ...showRoutes];
}
