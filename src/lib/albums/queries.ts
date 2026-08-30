import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Album } from "@/generated/prisma/client";

export type { Album };

export type PublicAlbum = {
  id: string;
  title: string;
  year: number;
  subtitle: string | null;
  coverImage: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  coverBlurDataURL: string | null;
  spotify: string | null;
  appleMusic: string | null;
};

/** Admin: all albums, newest first — always fresh (no cache) */
export async function getAllAlbums(): Promise<Album[]> {
  return prisma.album.findMany({ orderBy: [{ year: "desc" }, { createdAt: "desc" }] });
}

/** Public site: exclude hidden albums, newest first — cached with 'albums' tag */
export const getPublicAlbums = unstable_cache(
  async (): Promise<PublicAlbum[]> => {
    const albums = await prisma.album.findMany({
      where: { isHidden: false },
      // Secondary sort on createdAt breaks ties when two albums share the same year
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    });
    return albums.map((a) => ({
      id: a.id,
      title: a.title,
      year: a.year,
      subtitle: a.subtitle,
      coverImage: a.coverImage,
      coverWidth: a.coverWidth,
      coverHeight: a.coverHeight,
      coverBlurDataURL: a.coverBlurDataURL,
      spotify: a.spotify,
      appleMusic: a.appleMusic,
    }));
  },
  ["public-albums"],
  { tags: ["albums"] }
);

export async function getAlbumById(id: string): Promise<Album | null> {
  return prisma.album.findUnique({ where: { id } });
}
