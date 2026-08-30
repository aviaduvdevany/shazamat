import React from "react";
import Image from "next/image";
import { getPublicShows } from "@/lib/shows/queries";
import type { PublicShow } from "@/lib/shows/queries";
import { isPastShow } from "@/lib/dates";

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day}.${month}.${String(year).slice(2)}`;
}

function FeaturedContent({ featured }: { featured: PublicShow }) {
  const { venue, city, date, doorsTime, coverImage, ticketLink } = featured;
  const displayDate = formatDisplayDate(date);

  const roughTextureSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='rough'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23rough)'/%3E%3C/svg%3E")`;

  return (
    <section
      id="upcoming-show"
      className="relative py-20 md:py-32 bg-black text-white overflow-hidden"
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#1a0a00] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#db7738] opacity-5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#db7738] opacity-5 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none grunge-overlay opacity-30" />
      <div className="absolute inset-0 noise-overlay opacity-15" />

      <div className="container-custom relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Promotional Image */}
            {coverImage && (
              <div className="flex-1 w-full lg:w-auto relative group">
                <div
                  className="absolute -inset-8 bg-[#db7738] opacity-10 blur-2xl group-hover:opacity-15 transition-opacity duration-500"
                  style={{ clipPath: "polygon(2% 0, 98% 2%, 100% 98%, 0 100%)" }}
                />
                <div
                  className="absolute -inset-4 border-2 border-[#db7738]/30 opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  style={{ clipPath: "polygon(2% 0, 98% 2%, 100% 98%, 0 100%)" }}
                />
                <div
                  className="relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500"
                  style={{ clipPath: "polygon(3% 0, 97% 2%, 100% 97%, 0 100%)" }}
                >
                  <div className="relative aspect-[4/5] md:aspect-[4/4] w-full max-w-md mx-auto">
                    <Image
                      src={coverImage}
                      alt={`שאזאמאט ${venue} - ${displayDate}`}
                      fill
                      className="object-cover brightness-100 group-hover:brightness-110 transition-all duration-500"
                      priority
                      quality={85}
                      sizes="(max-width: 768px) 90vw, 28rem"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#db7738]/5 pointer-events-none" />
                  </div>
                </div>
                <div
                  className="absolute -bottom-2 right-4 w-32 h-1.5 bg-[#db7738] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)",
                    transform: "rotate(1deg)",
                    boxShadow: "0 2px 8px rgba(219,119,56,0.4)",
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 w-full lg:w-auto text-center lg:text-right space-y-6 lg:space-y-8">
              <div className="relative inline-block">
                <h2
                  className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-none mb-3"
                  style={{
                    textShadow:
                      "4px 4px 0 rgba(0,0,0,0.5), 0 0 20px rgba(219,119,56,0.3), -2px -2px 0 rgba(255,255,255,0.1)",
                    transform: "rotate(-1deg)",
                    letterSpacing: "-0.03em",
                    color: "#db7738",
                  }}
                >
                  {venue}
                </h2>
                <div
                  className="absolute bottom-[-6px] right-0 w-[85%] h-[5px] bg-[#db7738] opacity-80"
                  style={{
                    clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%, 0 80%)",
                    transform: "rotate(0.8deg)",
                    boxShadow: "0 2px 8px rgba(219,119,56,0.4)",
                  }}
                />
                <div
                  className="absolute -inset-4 bg-[#db7738] opacity-10 blur-xl"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                />
              </div>

              <div className="relative">
                <div
                  className="text-2xl md:text-3xl font-bold text-white/90 mb-2"
                  style={{
                    textShadow: "2px 2px 0 rgba(0,0,0,0.3)",
                    letterSpacing: "0.05em",
                    transform: "rotate(0.3deg)",
                  }}
                >
                  {city}
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className="text-xl md:text-2xl font-black text-white"
                  style={{
                    textShadow: "2px 2px 0 rgba(0,0,0,0.4)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {displayDate}
                </div>
                {doorsTime && (
                  <div
                    className="text-base md:text-lg text-white/80 font-medium"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    דלתות {doorsTime}
                  </div>
                )}
              </div>

              {ticketLink && (
                <div className="pt-6 space-y-4">
                  <div className="relative inline-block">
                    <a
                      href={ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-block px-10 py-5 text-xl md:text-2xl font-black border-[3px] border-[#db7738] text-white bg-[#db7738] hover:bg-transparent hover:text-[#db7738] relative overflow-hidden btn-featured"
                      aria-label={`כרטיסים להופעה ${venue}, ${city}`}
                    >
                      <span className="relative z-10">כרטיסים</span>
                      <div className="absolute inset-0 bg-[#db7738] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: roughTextureSvg, backgroundSize: "20px 20px" }}
                      />
                    </a>
                    <div
                      className="absolute -inset-2 bg-[#db7738] opacity-20 blur-md -z-10"
                      style={{ clipPath: "polygon(3% 0, 97% 2%, 100% 97%, 0 100%)" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function UpcomingShow() {
  const shows = await getPublicShows();
  // Only show a featured block if the show hasn't already passed
  const featured = shows.find((s) => s.isFeatured && !isPastShow(s.date)) ?? null;
  if (!featured) return null;
  return <FeaturedContent featured={featured} />;
}
