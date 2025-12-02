"use client";
import React from "react";

interface ShowCardProps {
  day: string;
  month: string;
  city: string;
  venue: string;
}

export default function ShowCard({ day, month, city, venue }: ShowCardProps) {
  return (
    <div className="flex flex-row md:items-center justify-between py-4 md:py-5 gap-4 md:gap-0 relative group">
      {/* Rough background highlight on hover */}
      <div
        className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300"
        style={{
          clipPath: "polygon(2% 0, 98% 2%, 100% 98%, 0 100%)",
        }}
      />

      {/* Date Section - more bold and rough */}
      <div className="flex-shrink-0 md:w-28 text-left relative z-10">
        <div
          className="text-xs font-bold text-black uppercase tracking-wider opacity-60"
          style={{
            letterSpacing: "0.15em",
            transform: "translateX(-1px)",
          }}
        >
          {month}
        </div>
        <div
          className="text-3xl font-black text-black leading-none mt-1"
          style={{
            textShadow: "1px 1px 0 rgba(0,0,0,0.1)",
            letterSpacing: "-0.03em",
          }}
        >
          {day}
        </div>
      </div>

      {/* Event Details Section - bolder typography */}
      <div className="flex-1 md:px-6 relative z-10">
        <div
          className="text-lg font-bold text-black mb-1"
          style={{
            letterSpacing: "-0.01em",
            textShadow: "0.5px 0.5px 0 rgba(0,0,0,0.05)",
          }}
        >
          {venue}
        </div>
        <div
          className="text-sm font-medium text-black opacity-70"
          style={{
            letterSpacing: "0.02em",
          }}
        >
          {city}
        </div>
      </div>

      {/* Action Buttons - rougher, more street art style */}
      <div className="flex-shrink-0 flex gap-2 mt-4 md:mt-0 relative z-10">
        <button
          className="px-4 py-2 text-sm font-bold border-2 border-black text-black bg-white hover:bg-black hover:text-white transition-all duration-200 relative overflow-hidden"
          style={{
            boxShadow:
              "2px 2px 0 rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.05)",
            transform: "translateY(-1px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "1px 1px 0 rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "2px 2px 0 rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.05)";
          }}
        >
          <span className="relative z-10">כרטיסים</span>
          {/* Rough texture overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='rough'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23rough)'/%3E%3C/svg%3E")`,
              backgroundSize: "20px 20px",
            }}
          />
        </button>
      </div>
    </div>
  );
}
