import React from "react";
import { socialPlatforms } from "@/data";
import Image from "next/image";

export default function SocialLinks() {
  return (
      <div className="flex justify-center gap-2 ">
        {socialPlatforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            aria-label={platform.name}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-[var(--duration-base)]"
          >
            <Image src={platform.icon} alt={platform.name} width={30} height={30} className="object-contain hover:scale-110 transition-transform duration-300" />
          </a>
        ))}
      </div>
  );
}
