"use client";
import React from "react";
import { formatDateToHebrew } from "@/lib/hebrew";

interface ShowCardProps {
  date: string; // ISO date string (YYYY-MM-DD)
  city: string;
  venue: string;
  isPast?: boolean;
  ticketLink?: string;
}

const BUTTON_STYLES = {
  default: {
    transform: "translateY(-1px)",
    boxShadow: "2px 2px 0 rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.05)",
  },
  hover: {
    transform: "translateY(0px)",
    boxShadow: "1px 1px 0 rgba(0,0,0,0.1)",
  },
} as const;

export default function ShowCard({
  date,
  city,
  venue,
  isPast = false,
  ticketLink,
}: ShowCardProps) {
  const { day, month } = formatDateToHebrew(date);
  const buttonLabel = isPast
    ? `כרטיסים להופעה ב-${venue}, ${city} - הופעה זו כבר התקיימה`
    : `קנה כרטיסים להופעה ב-${venue}, ${city}`;

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isPast) {
      Object.assign(e.currentTarget.style, BUTTON_STYLES.hover);
    }
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isPast) {
      Object.assign(e.currentTarget.style, BUTTON_STYLES.default);
    }
  };

  return (
    <div
      className={`flex flex-row md:items-center justify-between py-4 md:py-5 gap-4 md:gap-0 relative group ${
        isPast ? "opacity-60" : ""
      }`}
    >
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
          className={`text-xs font-bold text-black uppercase tracking-wider opacity-60 ${
            isPast ? "line-through decoration-2 decoration-black/80" : ""
          }`}
          style={{
            letterSpacing: "0.15em",
            transform: "translateX(-1px)",
          }}
        >
          {month}
        </div>
        <div
          className={`text-3xl font-black text-black leading-none mt-1 ${
            isPast ? "line-through decoration-2 decoration-black/40" : ""
          }`}
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
          className={`text-lg font-bold text-black mb-1 ${
            isPast ? "line-through decoration-2 decoration-black/40" : ""
          }`}
          style={{
            letterSpacing: "-0.01em",
            textShadow: "0.5px 0.5px 0 rgba(0,0,0,0.05)",
          }}
        >
          {venue}
        </div>
        <div
          className={`text-sm font-medium text-black opacity-70 ${
            isPast ? "line-through decoration-2 decoration-black/30" : ""
          }`}
          style={{
            letterSpacing: "0.02em",
          }}
        >
          {city}
        </div>
      </div>

      {/* Action Buttons - rougher, more street art style */}
      <div className="flex-shrink-0 flex gap-2 mt-4 md:mt-0 relative z-10">
        {ticketLink && !isPast ? (
          <a
            href={ticketLink}
            className={`px-4 py-2 text-sm font-bold border-2 border-black text-black bg-white transition-all duration-200 relative overflow-hidden rounded-xs hover:bg-black hover:text-white inline-block`}
            style={BUTTON_STYLES.default}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, BUTTON_STYLES.hover);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, BUTTON_STYLES.default);
            }}
            aria-label={buttonLabel}
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
          </a>
        ) : (
          <button
            disabled={isPast}
            aria-disabled={isPast}
            className={`px-4 py-2 text-sm font-bold border-2 border-black text-black bg-white transition-all duration-200 relative overflow-hidden rounded-xs ${
              isPast
                ? "opacity-40 cursor-not-allowed line-through decoration-2"
                : "hover:bg-black hover:text-white"
            }`}
            style={BUTTON_STYLES.default}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
            aria-label={buttonLabel}
          >
            <span className="relative z-10">כרטיסים</span>
            {/* Rough texture overlay */}
            {!isPast && (
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='rough'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23rough)'/%3E%3C/svg%3E")`,
                  backgroundSize: "20px 20px",
                }}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
