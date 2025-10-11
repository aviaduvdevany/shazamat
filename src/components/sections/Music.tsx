import React from "react";
import AlbumCard from "@/components/ui/AlbumCard";
import StreamingPlatforms from "@/components/ui/StreamingPlatforms";
import { albums } from "@/data";

export default function Music() {
  return (
    <section id="music" className="py-24 md:py-32 bg-black text-white">
      <div className="container-custom">
        <h2 className="text-[clamp(40px,5vw,64px)] font-bold mb-12 text-center">
          המוזיקה שלנו
        </h2>

        <div className="max-w-6xl mx-auto">
          {/* Album Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {albums.map((album) => (
              <AlbumCard key={album.id} {...album} />
            ))}
          </div>

          {/* Streaming Platforms */}
          <StreamingPlatforms />
        </div>
      </div>
    </section>
  );
}
