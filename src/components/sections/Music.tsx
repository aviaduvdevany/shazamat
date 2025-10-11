import React from "react";
import AlbumCard from "@/components/ui/AlbumCard";
import StreamingPlatforms from "@/components/ui/StreamingPlatforms";
import { albums } from "@/data";

export default function Music() {
  return (
    <section id="music" className="py-24 md:py-32 bg-black text-white">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            {/* Albums List - Left Side */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="space-y-6">
                {albums.map((album, index) => (
                  <div key={album.id}>
                    <AlbumCard {...album} />
                    {index !== albums.length - 1 && (
                      <div className="w-full h-[1px] bg-gray-700 mt-6" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Large Title - Right Side */}
            <div className="flex-shrink-0">
              <h2 className="lg:text-[120px] text-[80px] font-bold leading-none text-right">
                אלבומים
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
