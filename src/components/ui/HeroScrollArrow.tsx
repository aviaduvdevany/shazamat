"use client";

import React, { useState, useEffect } from "react";

export default function HeroScrollArrow() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleClick() {
    // Land on the featured ticket block if it exists, otherwise fall back to shows list
    const target =
      document.getElementById("upcoming-show") ??
      document.getElementById("shows");
    if (!target) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  return (
    <div
      className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-500 ${
        scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <button
        onClick={handleClick}
        className="flex flex-col items-center gap-2 group"
        aria-label="גלול למטה להופעה הקרובה"
      >
        <div className="relative w-6 h-6 animate-scroll-arrow">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/70 group-hover:text-white/70 transition-colors duration-300"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </button>
    </div>
  );
}
