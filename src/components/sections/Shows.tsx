import React from "react";
import ShowCard from "@/components/ui/ShowCard";
import { upcomingShows } from "@/data";

export default function Shows() {
  return (
    <section id="shows" className="py-24 md:py-32 bg-white text-black">
      <div className="container-custom">
        <h2 className="text-[clamp(40px,5vw,64px)] font-bold mb-12 text-center">
          הופעות קרובות
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">
          {upcomingShows.map((show) => (
            <ShowCard key={show.id} {...show} />
          ))}
        </div>
      </div>
    </section>
  );
}
