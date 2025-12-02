"use client";
import React from "react";
import AlbumCard from "@/components/ui/AlbumCard";
import { albums } from "@/data";

export default function Music() {
  const scrollToAlbum = (albumId: number) => {
    const element = document.getElementById(`album-${albumId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="music"
      className="py-32 md:py-48 bg-black text-white relative overflow-hidden"
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none grunge-overlay" />

      <div className="container-custom relative z-10">
        {/* Massive Title - Breaking boundaries */}
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

          {/* Decorative elements */}
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

        {/* Year timeline indicator - Moved to top with scroll functionality */}
        <div className="mb-24 md:mb-32 pb-8 border-b border-white/10">
          <div className="flex flex-wrap gap-6 md:gap-12 justify-center items-center">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => scrollToAlbum(album.id)}
                className="text-center group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div
                  className="text-5xl md:text-7xl font-black text-white/20 group-hover:text-white/40 transition-colors duration-300"
                  style={{
                    transform: "rotate(-1deg)",
                    textShadow: "2px 2px 0 rgba(0,0,0,0.3)",
                  }}
                >
                  {album.year}
                </div>
                <div className="text-xs md:text-sm text-white/30 mt-2 font-medium group-hover:text-white/50 transition-colors">
                  {album.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Album Layout - All albums stacked, centered, same size */}
        <div className="space-y-16 md:space-y-24">
          {albums.map((album, index) => {
            // Subtle rotations in different directions
            const rotations = [
              "md:rotate(-1.2deg)",
              "md:rotate(1.5deg)",
              "md:rotate(-0.8deg)",
              "md:rotate(1.3deg)",
              "md:rotate(-1deg)",
            ];

            const rotation = rotations[index] || "";

            return (
              <div
                key={album.id}
                id={`album-${album.id}`}
                className="relative w-full flex justify-center transition-all duration-700 hover:scale-[1.02] scroll-mt-24 md:scroll-mt-32"
              >
                <div
                  className="relative w-full max-w-[400px] md:max-w-[450px] aspect-square md:aspect-[4/5] group"
                  style={{
                    transform: rotation,
                  }}
                >
                  {/* Hover glow effect */}
                  <div className="absolute -inset-2 bg-white opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-lg" />

                  {/* Album card with enhanced styling */}
                  <div className="relative w-full h-full bg-transparent">
                    <AlbumCard {...album} />
                  </div>

                  {/* Decorative corner element */}
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
