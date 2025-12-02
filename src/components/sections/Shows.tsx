"use client";
import React from "react";
import ShowCard from "@/components/ui/ShowCard";
import { upcomingShows } from "@/data";

export default function Shows() {
  return (
    <section
      id="shows"
      className="py-24 md:py-32 bg-white text-black relative overflow-hidden"
    >
      {/* Grunge texture overlay - pure CSS */}
      <div className="absolute inset-0 pointer-events-none grunge-overlay" />

      <div className="container-custom relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            {/* Large Title - Right Side with grunge effect */}
            <div className="flex-shrink-0 relative">
              {/* Rough shadow/outline effect */}
              <h2
                className="lg:text-[120px] text-[80px] leading-none text-right relative"
                style={{
                  textShadow: `
                    -2px -2px 0 #000,
                    2px -2px 0 #000,
                    -2px 2px 0 #000,
                    2px 2px 0 #000,
                    4px 4px 8px rgba(0,0,0,0.1),
                    -1px -1px 0 rgba(0,0,0,0.3),
                    1px 1px 0 rgba(0,0,0,0.3)
                  `,
                  transform: "rotate(2deg)",
                }}
              >
                <span className="relative z-10">הופעות</span>
              </h2>
              {/* Hand-drawn underline effect */}
              <div
                className="absolute bottom-[-8px] right-0 w-[85%] h-[6px] bg-black opacity-20"
                style={{
                  clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%, 0 80%)",
                  transform: "rotate(0.3deg)",
                }}
              />
            </div>

            {/* Shows List - Left Side with rough edges */}
            <div className="flex-1 w-full lg:w-auto relative">
              {/* Rough border effect */}
              <div
                className="absolute -inset-4 border-2 border-black opacity-5"
                style={{
                  clipPath: "polygon(2% 0, 98% 2%, 100% 98%, 0 100%)",
                }}
              />

              <div className="space-y-6 relative">
                {upcomingShows.map((show, index) => (
                  <div key={show.id} className="relative">
                    {/* Slight rotation for hand-placed feel */}
                    <div
                      style={{
                        transform:
                          index % 2 === 0
                            ? "rotate(0.2deg)"
                            : "rotate(-0.15deg)",
                      }}
                    >
                      <ShowCard {...show} />
                    </div>
                    {index !== upcomingShows.length - 1 && (
                      <div
                        className="w-full h-[2px] bg-black opacity-10 relative mt-6"
                        style={{
                          clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
