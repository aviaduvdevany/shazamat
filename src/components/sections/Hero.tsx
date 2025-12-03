"use client";
import React, { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Logo from "../ui/Logo";
import HeroImageFallback from "../ui/HeroImageFallback";
import Link from "next/link";
import { socialPlatforms } from "@/data";

const VideoBackground = dynamic(() => import("../ui/VideoBackground"), {
  ssr: false,
  loading: () => <HeroImageFallback />,
});

export default function Hero() {
  const [videoReady, setVideoReady] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Image Fallback - visible on mobile or until video is ready on desktop */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          videoReady
            ? "md:opacity-0 md:pointer-events-none opacity-100"
            : "opacity-100"
        }`}
      >
        <HeroImageFallback />
      </div>

      {/* Video Background with Image Fallback - Hidden on mobile */}
      <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden">
        <Suspense fallback={null}>
          <VideoBackground onReady={() => setVideoReady(true)} />
        </Suspense>
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center py-20">
        <div className="max-w-4xl mx-auto">
          {/* Main title */}
          <h1 className="text-[clamp(50px,8vw,120px)] font-bold mb-4 leading-none">
            <Logo width={650} height={300} variant="logo" />
          </h1>

          {/* Social Links - Compact */}
          <div className="flex justify-center items-center gap-6 mb-6">
            {socialPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.name}
                className="w-8 h-8 hover:scale-110 transition-transform duration-300 opacity-90"
              >
                <Image
                  src={platform.icon}
                  alt={platform.name}
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#music">
            <button className="bg-white text-black px-8 py-4 rounded-xs font-bold text-lg hover:bg-white transition-all duration-[var(--duration-base)] min-w-[200px]">
              מוזיקה
            </button>
            </Link>
            <Link href="#shows">
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xs font-bold text-lg hover:bg-white hover:text-black transition-all duration-[var(--duration-base)] min-w-[200px]">
              הופעות
            </button>
            </Link>
          </div> */}
        </div>
      </div>

      {/* Scroll Indicator - Arrow */}
      <div
        className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-500 ${
          scrollY > 50 ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <button
          onClick={() => {
            const showsSection = document.getElementById("shows");
            if (showsSection) {
              showsSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="flex flex-col items-center gap-2 group"
          aria-label="Scroll down"
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
    </section>
  );
}
