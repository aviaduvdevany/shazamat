import React from "react";
import Image from "next/image";
import AlbumCard from "@/components/ui/AlbumCard";
import YearNav from "@/components/ui/YearNav";
import { getPublicAlbums } from "@/lib/albums/queries";

const rotations = [
  "md:rotate(-1.2deg)",
  "md:rotate(1.5deg)",
  "md:rotate(-0.8deg)",
  "md:rotate(1.3deg)",
  "md:rotate(-1deg)",
];

export default async function Music() {
  const albums = await getPublicAlbums();

  return (
    <section
      id="music"
      className="py-24 md:py-32 bg-black text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none grunge-overlay" />

      <div className="container-custom relative z-10">
        {/* Massive Title */}
        <div className="relative mb-16 md:mb-20">
          <h2
            className="lg:text-[140px] text-[100px] font-black leading-none text-left relative z-10"
            style={{
              transform: "rotate(-2deg)",
              textShadow: `
                -4px -4px 0 #000,
                4px -4px 0 #000,
                -4px 4px 0 #000,
                4px 4px 0 #000,
                8px 8px 0 rgba(0,0,0,0.3),
                12px 12px 20px rgba(0,0,0,0.2)
              `,
              letterSpacing: "-0.03em",
            }}
          >
            <span className="relative z-10">מוזיקה</span>
          </h2>

          <div
            className="absolute top-[-20px] left-[10%] w-[120px] h-[8px] bg-white opacity-20"
            style={{
              transform: "rotate(15deg)",
              clipPath: "polygon(0 0, 90% 0, 100% 100%, 10% 100%)",
            }}
          />
          <div
            className="absolute bottom-[-30px] right-[15%] w-[80px] h-[6px] bg-white opacity-15"
            style={{
              transform: "rotate(-10deg)",
              clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>

        {/* Year navigation — client island (scroll-to behavior) */}
        <YearNav albums={albums.map((a) => ({ id: a.id, year: a.year, title: a.title }))} />

        {/* Album list */}
        <div className="space-y-16 md:space-y-24">
          {albums.map((album, index) => (
            <article
              key={album.id}
              id={`album-${album.id}`}
              className="relative w-full py-16 md:py-24 flex flex-col items-center transition-all duration-700 scroll-mt-24 md:scroll-mt-32 overflow-hidden"
              aria-labelledby={`album-title-${album.id}`}
            >
              {/* Blurred background — tiny source, heavily blurred = tiny cost */}
              {album.coverImage && (
                <div className="absolute inset-0 opacity-60 pointer-events-none overflow-hidden">
                  <div
                    className="absolute"
                    style={{ top: "-60%", left: "-60%", right: "-60%", bottom: "-60%" }}
                  >
                    <Image
                      src={album.coverImage}
                      alt=""
                      fill
                      aria-hidden="true"
                      className="object-cover"
                      style={{ filter: "blur(24px) saturate(1.4)" }}
                      quality={35}
                      sizes="30vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              )}

              {/* Year + title overlay — desktop only (aria-hidden since mobile h3 carries the id) */}
              <div className="absolute top-8 md:top-12 left-0 right-0 z-10 pointer-events-none hidden md:block">
                <div className="container-custom">
                  <div className="flex flex-col items-center md:items-start gap-2 md:gap-3">
                    <div
                      className="text-3xl md:text-8xl font-black text-white/60"
                      aria-hidden="true"
                      style={{
                        transform: "rotate(-1deg)",
                        textShadow: "4px 4px 0 rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)",
                        letterSpacing: "-0.05em",
                      }}
                    >
                      {album.year}
                    </div>
                    <p
                      aria-hidden="true"
                      className="text-xl md:text-3xl font-black text-white/70 text-center md:text-right"
                      style={{
                        textShadow: "2px 2px 0 rgba(0,0,0,0.5), 0 0 15px rgba(0,0,0,0.3)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {album.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Album card */}
              <div
                className="relative w-full max-w-[400px] md:max-w-[450px] aspect-square group z-10"
                style={{ transform: rotations[index] || "" }}
              >
                <div className="absolute -inset-2 bg-white opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-lg" />
                <div className="relative w-full h-full bg-transparent">
                  <AlbumCard
                    coverImage={album.coverImage ?? undefined}
                    albumTitle={album.title}
                    albumYear={String(album.year)}
                    blurDataURL={album.coverBlurDataURL ?? undefined}
                  />
                </div>
                {index % 2 === 0 && (
                  <div
                    className="hidden md:block absolute -top-4 -right-4 w-16 h-16 border-2 border-white opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{
                      transform: "rotate(45deg)",
                      clipPath: "polygon(0 0, 50% 0, 100% 50%, 50% 50%)",
                    }}
                  />
                )}
              </div>

              {/* Mobile-only title — visible on small screens; carries the aria label id */}
              <div className="md:hidden text-center mt-5 space-y-1 relative z-10 px-4">
                <div
                  className="text-2xl font-black text-white/50"
                  aria-hidden="true"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {album.year}
                </div>
                <h3
                  id={`album-title-${album.id}`}
                  className="text-base font-black text-white/70"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {album.title}
                </h3>
              </div>

              {/* Streaming links — use <img> for SVGs (no optimization needed) */}
              {(album.spotify || album.appleMusic) && (
                <div className="relative z-10 flex items-center justify-center gap-4 md:gap-6 mt-6">
                  {album.spotify && (
                    <a
                      href={album.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-12 h-12 md:w-16 md:h-16 hover:scale-110 transition-transform duration-300 flex items-center justify-center"
                      aria-label={`האזן לאלבום ${album.title} ב-Spotify`}
                    >
                      <img
                        src="/icons/Spotify_logo.svg"
                        alt=""
                        aria-hidden="true"
                        width={48}
                        height={48}
                        className="object-contain drop-shadow-lg w-full h-full"
                      />
                    </a>
                  )}
                  {album.appleMusic && (
                    <a
                      href={album.appleMusic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-12 h-12 md:w-16 md:h-16 hover:scale-110 transition-transform duration-300 flex items-center justify-center"
                      aria-label={`האזן לאלבום ${album.title} ב-Apple Music`}
                    >
                      <img
                        src="/icons/Apple_Music_icon.svg"
                        alt=""
                        aria-hidden="true"
                        width={48}
                        height={48}
                        className="object-contain drop-shadow-lg w-full h-full"
                      />
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
