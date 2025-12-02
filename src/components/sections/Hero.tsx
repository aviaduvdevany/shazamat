"use client";
import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import Logo from "../ui/Logo";
import HeroImageFallback from "../ui/HeroImageFallback";

const VideoBackground = dynamic(() => import("../ui/VideoBackground"), {
  ssr: false,
  loading: () => <HeroImageFallback />,
});

export default function Hero() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Image Fallback - visible until video is ready */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          videoReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <HeroImageFallback />
      </div>

      {/* Video Background with Image Fallback */}
      <Suspense fallback={<HeroImageFallback />}>
        <VideoBackground onReady={() => setVideoReady(true)} />
      </Suspense>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center py-20">
        <div className="max-w-4xl mx-auto">
          {/* Main title */}
          <h1 className="text-[clamp(50px,8vw,120px)] font-bold mb-6 leading-none">
            <Logo width={550} height={200} variant="logo" />
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-black px-8 py-4 rounded-[var(--radius-md)] font-bold text-lg hover:bg-white transition-all duration-[var(--duration-base)] min-w-[200px]">
              מוזיקה
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-[var(--radius-md)] font-bold text-lg hover:bg-white hover:text-black transition-all duration-[var(--duration-base)] min-w-[200px]">
              הופעות
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
