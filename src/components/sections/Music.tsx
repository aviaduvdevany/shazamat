import React from "react";
import AlbumCard from "@/components/ui/AlbumCard";
import StreamingPlatforms from "@/components/ui/StreamingPlatforms";
import { albums } from "@/data";

export default function Music() {
  return (
    <section id="music" className="py-24 md:py-32 bg-black text-white">
      <div className="container-custom">
        {/* Large Title - Left Side */}
        <div className="flex-shrink-0">
          <h2 className="lg:text-[120px] text-[80px] font-bold leading-none text-left mb-24">
            אלבומים
          </h2>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            {/* Albums Grid - Left Side */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {albums.map((album) => (
                  <AlbumCard key={album.id} {...album} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
