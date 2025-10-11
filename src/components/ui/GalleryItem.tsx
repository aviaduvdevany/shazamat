import React from "react";

interface GalleryItemProps {
  index: number;
}

export default function GalleryItem({ index }: GalleryItemProps) {
  return (
    <div className="aspect-square bg-gray-800 rounded-[var(--radius-sm)] overflow-hidden relative group cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold opacity-20">{index}</div>
      </div>
      <div className="absolute inset-0 bg-[var(--shazamat-orange)] opacity-0 group-hover:opacity-30 transition-opacity duration-[var(--duration-base)]"></div>
    </div>
  );
}
