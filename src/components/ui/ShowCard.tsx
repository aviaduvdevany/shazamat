import React from "react";

interface ShowCardProps {
  day: string;
  month: string;
  city: string;
  venue: string;
}

export default function ShowCard({ day, month, city, venue }: ShowCardProps) {
  return (
    <div className="bg-white text-black rounded-[var(--radius-md)] p-6 md:p-8 border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-3">
            {/* Date Badge */}
            <div className="bg-[var(--shazamat-orange)] text-white rounded-[var(--radius-sm)] p-3 text-center min-w-[60px]">
              <div className="text-2xl font-bold leading-none">{day}</div>
              <div className="text-sm leading-none mt-1">{month}</div>
            </div>

            {/* Show Info */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-1">{city}</h3>
              <p className="text-gray-600 text-lg">{venue}</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="bg-[var(--shazamat-orange)] text-black px-6 py-3 rounded-[var(--radius-md)] font-bold hover:bg-black hover:text-white transition-colors duration-[var(--duration-base)]">
          קנה כרטיסים
        </button>
      </div>
    </div>
  );
}
