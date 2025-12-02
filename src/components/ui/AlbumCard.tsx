"use client";
import React from "react";
import Image from "next/image";

interface AlbumCardProps {
  title: string;
  year: string;
  coverImage?: string;
  spotify?: string;
  appleMusic?: string;
}

export default function AlbumCard({
  title,
  year,
  coverImage,
  spotify,
  appleMusic,
}: AlbumCardProps) {
  return (
    <div className="w-full h-full relative group">
      {/* Album Cover - Dominant Element filling the entire card */}
      <div className="relative w-full h-full bg-gray-800 overflow-hidden">
        {/* Rough border effect */}
        <div
          className="absolute -inset-1 border-2 border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
          style={{
            clipPath: "polygon(3% 0, 97% 2%, 100% 97%, 0 100%)",
          }}
        />

        {coverImage ? (
          <div className="relative w-full h-full">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-white text-2xl font-bold opacity-50">
              שאזאמאט
            </div>
          </div>
        )}

        {/* Year badge - positioned on cover */}
        <div
          className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm border border-white/20 z-10"
          style={{
            clipPath: "polygon(0 0, 90% 0, 100% 100%, 10% 100%)",
            transform: "rotate(1deg)",
          }}
        >
          <div className="text-[var(--shazamat-orange)] font-black text-sm">
            {year}
          </div>
        </div>

        {/* Album Details - Overlaid at bottom of cover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          {/* Album Title - Large and bold */}
          <div
            className="text-white font-black text-xl md:text-2xl leading-tight text-right group-hover:text-[var(--shazamat-orange)] transition-colors duration-500"
            style={{
              textShadow: "2px 2px 0 rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.5)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}
