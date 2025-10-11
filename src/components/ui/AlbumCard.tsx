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
    <div className="w-full">
      {/* Album Cover - Main Element */}
      <div className="aspect-square bg-gray-800 overflow-hidden relative mb-4">
        {coverImage ? (
          <Image src={coverImage} alt={title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-white text-2xl font-bold opacity-50">
              שאזאמאט
            </div>
          </div>
        )}
      </div>

      {/* Separator Line */}
      <div className="w-full h-[1px] bg-gray-600 mb-4"></div>

      {/* Album Details */}
      <div className="space-y-2">
        {/* Top Row - Streaming Icons and Year */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Spotify Icon */}
            <a
              href={spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="w-5 h-5 bg-white rounded-sm flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.414c-.391.391-.391 1.023 0 1.414.391.391 1.023.391 1.414 0 .391-.391.391-1.023 0-1.414-.391-.391-1.023-.391-1.414 0z" />
              </svg>
            </a>

            {/* Apple Music Icon */}
            <a
              href={appleMusic}
              target="_blank"
              rel="noopener noreferrer"
              className="w-5 h-5 bg-white rounded-sm flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FA243C">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
              </svg>
            </a>
          </div>

          {/* Year */}
          <div className="text-[var(--shazamat-orange)] font-bold text-sm">
            {year}
          </div>
        </div>

        {/* Album Title */}
        <div className="text-white font-medium text-base leading-tight text-right">
          {title}
        </div>
      </div>
    </div>
  );
}
