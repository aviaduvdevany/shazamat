import React from "react";
import { streamingPlatforms } from "@/data";

export default function StreamingPlatforms() {
  return (
    <div className="mt-16 text-center">
      <p className="text-xl mb-6 text-gray-600">האזן בפלטפורמות המובילות</p>
      <div className="flex flex-wrap justify-center gap-4">
        {streamingPlatforms.map((platform) => (
          <button
            key={platform}
            className="px-6 py-3 bg-black text-white rounded-[var(--radius-md)] hover:bg-[var(--shazamat-orange)] hover:text-black transition-colors duration-[var(--duration-base)] font-medium"
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
}
