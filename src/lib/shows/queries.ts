import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Show } from "@/generated/prisma/client";

export type { Show };

export type ShowWithStatus = Show & { isPast: boolean };

/** Date as YYYY-MM-DD string — safe to serialize across Server/Client boundary */
export type PublicShow = {
  id: string;
  date: string;
  city: string;
  venue: string;
  ticketLink: string | null;
  doorsTime: string | null;
  coverImage: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  coverBlurDataURL: string | null;
  isFeatured: boolean;
  isPast: boolean;
};

function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Admin: all shows, newest first — always fresh (no cache) */
export async function getAllShows(): Promise<ShowWithStatus[]> {
  const today = getTodayStart();
  const shows = await prisma.show.findMany({ orderBy: { date: "desc" } });
  return shows.map((s) => ({ ...s, isPast: s.date < today }));
}

/** Public site: exclude hidden shows, upcoming first — cached with 'shows' tag */
export const getPublicShows = unstable_cache(
  async (): Promise<PublicShow[]> => {
    const today = getTodayStart();
    const shows = await prisma.show.findMany({
      where: { isHidden: false },
      orderBy: { date: "asc" },
    });
    return shows.map((s) => ({
      id: s.id,
      date: toDateString(s.date),
      city: s.city,
      venue: s.venue,
      ticketLink: s.ticketLink,
      doorsTime: s.doorsTime,
      coverImage: s.coverImage,
      coverWidth: s.coverWidth,
      coverHeight: s.coverHeight,
      coverBlurDataURL: s.coverBlurDataURL,
      isFeatured: s.isFeatured,
      isPast: s.date < today,
    }));
  },
  ["public-shows"],
  { tags: ["shows"] }
);

/** Public site: featured show — derived from cached shows (no extra DB round-trip) */
export async function getPublicFeaturedShow(): Promise<PublicShow | null> {
  const shows = await getPublicShows();
  return shows.find((s) => s.isFeatured) ?? null;
}

export async function getShowById(id: string): Promise<Show | null> {
  return prisma.show.findUnique({ where: { id } });
}

export async function getFeaturedShow(): Promise<Show | null> {
  return prisma.show.findFirst({ where: { isFeatured: true } });
}
