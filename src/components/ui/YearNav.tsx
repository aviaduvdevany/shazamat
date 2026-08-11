"use client";

import React from "react";

interface YearNavProps {
  albums: Array<{ id: string; year: number; title: string }>;
}

export default function YearNav({ albums }: YearNavProps) {
  function scrollToAlbum(albumId: string) {
    const element = document.getElementById(`album-${albumId}`);
    if (!element) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const offsetPosition =
      element.getBoundingClientRect().top + window.pageYOffset - 120;
    window.scrollTo({
      top: offsetPosition,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div className="mb-24 md:mb-32 pb-8 border-b border-white/10">
      <div className="flex flex-wrap gap-6 md:gap-12 justify-center items-center">
        {albums.map((album) => (
          <button
            key={album.id}
            onClick={() => scrollToAlbum(album.id)}
            className="text-center group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 md:active:scale-105 touch-manipulation"
            aria-label={`עבור לאלבום ${album.title} משנת ${album.year}`}
          >
            <div
              className="text-5xl md:text-7xl font-black text-white/70 md:text-white/40 group-hover:text-[var(--shazamat-orange)] active:text-[var(--shazamat-orange)] md:active:text-white/40 transition-colors duration-300"
              style={{
                transform: "rotate(-1deg)",
                textShadow: "2px 2px 0 rgba(0,0,0,0.3)",
              }}
            >
              {album.year}
            </div>
            <div className="text-xs md:text-sm text-white/80 md:text-white/50 mt-2 font-medium group-hover:text-[var(--shazamat-orange)] active:text-[var(--shazamat-orange)] md:active:text-white/50 transition-colors">
              {album.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
