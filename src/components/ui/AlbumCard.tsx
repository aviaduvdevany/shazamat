"use client";
import React from "react";
import Image from "next/image";

interface AlbumCardProps {
  coverImage?: string;
  albumTitle?: string;
  albumYear?: string;
}

export default function AlbumCard({
  coverImage,
  albumTitle,
  albumYear,
}: AlbumCardProps) {
  const altText =
    albumTitle && albumYear
      ? `עטיפת האלבום ${albumTitle} משנת ${albumYear}`
      : albumTitle
      ? `עטיפת האלבום ${albumTitle}`
      : "עטיפת אלבום";
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
              alt={altText}
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
      </div>
    </div>
  );
}
