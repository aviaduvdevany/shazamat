import { prisma } from "@/lib/prisma";
import type { Album } from "@/generated/prisma/client";

export type { Album };

export type PublicAlbum = {
  id: string;
  title: string;
  year: number;
  subtitle: string | null;
  coverImage: string | null;
  spotify: string | null;
  appleMusic: string | null;
};

/** Admin: all albums, newest first */
export async function getAllAlbums(): Promise<Album[]> {
  return prisma.album.findMany({ orderBy: { year: "desc" } });
}

/** Public site: exclude hidden albums, newest first */
export async function getPublicAlbums(): Promise<PublicAlbum[]> {
  const albums = await prisma.album.findMany({
    where: { isHidden: false },
    orderBy: { year: "desc" },
  });
  return albums.map((a) => ({
    id: a.id,
    title: a.title,
    year: a.year,
    subtitle: a.subtitle,
    coverImage: a.coverImage,
    spotify: a.spotify,
    appleMusic: a.appleMusic,
  }));
}

export async function getAlbumById(id: string): Promise<Album | null> {
  return prisma.album.findUnique({ where: { id } });
}
