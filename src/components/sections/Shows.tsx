import React from "react";
import ShowCard from "@/components/ui/ShowCard";
import { getPublicShows } from "@/lib/shows/queries";
import { isPastShow } from "@/lib/dates";

export default async function Shows() {
  const shows = await getPublicShows();

  // isPast computed fresh at render — never from the cache
  const upcoming = shows.filter((s) => !isPastShow(s.date));
  const past = shows.filter((s) => isPastShow(s.date));

  return (
    <section
      id="shows"
      className="py-24 md:py-32 bg-white text-black relative overflow-hidden"
    >
      {/* Grunge texture overlay */}
      <div className="absolute inset-0 pointer-events-none grunge-overlay" />

      <div className="container-custom relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            {/* Large Title */}
            <div className="flex-shrink-0 relative">
              <h2
                className="lg:text-[120px] text-[65px] leading-none text-right relative"
                style={{ transform: "rotate(2deg)" }}
              >
                <span className="relative z-10">הופעות</span>
              </h2>
              <div
                className="absolute bottom-[-8px] right-0 w-[85%] h-[6px] bg-black opacity-20"
                style={{
                  clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%, 0 80%)",
                  transform: "rotate(0.3deg)",
                }}
              />
            </div>

            {/* Shows List */}
            <div className="flex-1 w-full lg:w-auto relative">
              <div
                className="absolute -inset-4 border-2 border-black opacity-5"
                style={{ clipPath: "polygon(2% 0, 98% 2%, 100% 98%, 0 100%)" }}
              />
              <div className="space-y-6 relative">
                {[...upcoming, ...past].map((show, index, all) => {
                  const isShowPast = past.includes(show);
                  return (
                    <div key={show.id} className="relative">
                      <div
                        style={{
                          transform: index % 2 === 0 ? "rotate(0.2deg)" : "rotate(-0.15deg)",
                        }}
                      >
                        <ShowCard
                          date={show.date}
                          city={show.city}
                          venue={show.venue}
                          ticketLink={show.ticketLink ?? undefined}
                          isPast={isShowPast}
                        />
                      </div>
                      {index !== all.length - 1 && (
                        <div
                          className="w-full h-[2px] bg-black opacity-10 relative mt-6"
                          style={{ clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
