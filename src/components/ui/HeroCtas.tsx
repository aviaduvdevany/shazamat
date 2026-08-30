import React from "react";
import { getPublicAlbums } from "@/lib/albums/queries";
import { getPublicShows } from "@/lib/shows/queries";
import { isPastShow } from "@/lib/dates";

/**
 * Hero CTA row — async RSC.
 * Wrapped in Suspense by Hero.tsx so the static logo shell streams immediately.
 * - [album title] → latest album Spotify (omitted if no URL or no title)
 * - כרטיסים → featured show ticketLink, fallback #upcoming-show
 */
export default async function HeroCtas() {
  const [albums, shows] = await Promise.all([getPublicAlbums(), getPublicShows()]);

  const latestAlbum = albums[0];
  const listenUrl = latestAlbum?.spotify ?? null;
  const listenLabel = latestAlbum?.title ?? null;

  const featuredShow = shows.find((s) => s.isFeatured && !isPastShow(s.date));
  const ticketUrl = featuredShow?.ticketLink ?? null;
  const ticketHref = ticketUrl ?? "#upcoming-show";
  const ticketExternal = !!ticketUrl;

  return (
    <div className="flex justify-center items-center gap-4 flex-wrap mb-2">
      {listenUrl && listenLabel && (
        <a
          href={listenUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`האזן ל-${listenLabel} בספוטיפיי`}
          className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 text-lg font-black bg-[#db7738] text-white border-2 border-[#db7738] hover:bg-transparent hover:text-[#db7738] transition-all duration-300 shadow-lg"
        >
          {listenLabel}
        </a>
      )}
      <a
        href={ticketHref}
        {...(ticketExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        aria-label={ticketExternal ? "כרטיסים להופעה (נפתח בחלון חדש)" : "גלול לסעיף ההופעות"}
        className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 text-lg font-black bg-transparent text-white border-2 border-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
      >
        כרטיסים
      </a>
    </div>
  );
}
