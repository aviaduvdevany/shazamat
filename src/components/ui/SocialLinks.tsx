import React from "react";
import { socialPlatforms } from "@/data";
import Image from "next/image";

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-3">
      {socialPlatforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          aria-label={platform.name}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:scale-110 group shadow-sm"
        >
          <Image
            src={platform.icon}
            alt={platform.name}
            width={24}
            height={24}
            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        </a>
      ))}
    </div>
  );
}
