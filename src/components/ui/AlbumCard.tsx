import React from "react";

interface AlbumCardProps {
  title: string;
  year: string;
  subtitle?: string;
}

export default function AlbumCard({ title, year, subtitle }: AlbumCardProps) {
  return (
    <div className="group cursor-pointer">
      {/* Album Cover */}
      <div className="aspect-square bg-black rounded-[var(--radius-md)] overflow-hidden mb-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-4xl font-bold opacity-30">
            {subtitle || "שאזאמאט"}
          </div>
        </div>

        {/* Orange overlay on hover */}
        <div className="absolute inset-0 bg-[var(--shazamat-orange)] opacity-0 group-hover:opacity-20 transition-opacity duration-[var(--duration-base)]"></div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-base)]">
          <div className="w-16 h-16 bg-[var(--shazamat-orange)] rounded-full flex items-center justify-center">
            <svg width="24" height="24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Album Info */}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{year}</p>
    </div>
  );
}
