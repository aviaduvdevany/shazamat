import React from "react";

interface ShowCardProps {
  day: string;
  month: string;
  city: string;
  venue: string;
}


export default function ShowCard({ day, month, city, venue }: ShowCardProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:py-5 gap-4 md:gap-0">
      {/* Date Section */}
      <div className="flex-shrink-0 md:w-28 text-left">
        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {month}
        </div>
        <div className="text-2xl font-bold text-black">{day}</div>
      </div>

      {/* Event Details Section */}
      <div className="flex-1 md:px-6">
        <div className="text-base font-medium text-black mb-1">
          {venue}
        </div>
        <div className="text-sm text-gray-500">{city} </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-2 mt-4 md:mt-0">
        <button className="px-3 py-1.5 text-sm font-medium border border-black text-black hover:bg-black hover:text-white transition-colors duration-200">
          כרטיסים
        </button>
      </div>
    </div>
  );
}
