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

/** Admin: all shows, newest first */
export async function getAllShows(): Promise<ShowWithStatus[]> {
  const today = getTodayStart();
  const shows = await prisma.show.findMany({ orderBy: { date: "desc" } });
  return shows.map((s) => ({ ...s, isPast: s.date < today }));
}

/** Public site: exclude hidden shows, upcoming first */
export async function getPublicShows(): Promise<PublicShow[]> {
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
    isFeatured: s.isFeatured,
    isPast: s.date < today,
  }));
}

/** Public site: featured show — never returns hidden shows */
export async function getPublicFeaturedShow(): Promise<PublicShow | null> {
  const s = await prisma.show.findFirst({
    where: { isFeatured: true, isHidden: false },
  });
  if (!s) return null;
  const today = getTodayStart();
  return {
    id: s.id,
    date: toDateString(s.date),
    city: s.city,
    venue: s.venue,
    ticketLink: s.ticketLink,
    doorsTime: s.doorsTime,
    coverImage: s.coverImage,
    isFeatured: true,
    isPast: s.date < today,
  };
}

export async function getFeaturedShow(): Promise<Show | null> {
  return prisma.show.findFirst({ where: { isFeatured: true } });
}

export async function getShowById(id: string): Promise<Show | null> {
  return prisma.show.findUnique({ where: { id } });
}
