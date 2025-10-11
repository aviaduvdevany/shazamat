import React from "react";
import Logo from "../ui/Logo";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Vimeo Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src="https://player.vimeo.com/video/1126483445?h=a83562e4c3&autoplay=1&loop=1&muted=1&background=1&controls=0"
          className="video-background"
          style={{
            border: "none",
            pointerEvents: "none",
          }}
          allow="autoplay; fullscreen"
          title="Shazamat Background Video"
        />
      </div>

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
