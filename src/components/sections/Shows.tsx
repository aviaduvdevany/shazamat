import React from "react";
import ShowCard from "@/components/ui/ShowCard";
import { upcomingShows } from "@/data";

export default function Shows() {
  return (
    <section id="shows" className="py-24 md:py-32 bg-white text-black">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
             {/* Large Title - Right Side */}
             <div className="flex-shrink-0">
              <h2 className="text-[clamp(48px,8vw,120px)] font-bold leading-none text-right">
                הופעות
              </h2>
            </div>
            {/* Shows List - Left Side */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="space-y-6">
                {upcomingShows.map((show, index) => (
                  <>
                    <ShowCard key={show.id} {...show} />
                  {index !== upcomingShows.length - 1 && <div className="w-full h-[1px] bg-gray-200" />}
                  </>
                ))}
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </section>
  );
}
