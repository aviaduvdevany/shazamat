import React from "react";
import { socialPlatforms } from "@/data";

export default function SocialLinks() {
  return (
    <div className="mt-12">
      <p className="text-gray-600 mb-6">עקוב אחרינו</p>
      <div className="flex justify-center gap-6">
        {socialPlatforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            aria-label={platform.name}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-[var(--shazamat-orange)] transition-colors duration-[var(--duration-base)]"
          >
            <span className="text-white text-xl">{platform.icon}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
