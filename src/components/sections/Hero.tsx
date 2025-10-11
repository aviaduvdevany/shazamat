import Image from "next/image";
import React from "react";
import Logo from "../ui/Logo";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900"></div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center py-20">
        <div className="max-w-4xl mx-auto">
          {/* Main title */}
          <h1 className="text-[clamp(50px,8vw,120px)] font-bold mb-6 leading-none">
            <Logo width={100} height={100} variant="logo" />
            <span className="block text-[var(--shazamat-orange)] text-[clamp(40px,6vw,90px)]">
              SHAZAMAT
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-2xl mx-auto leading-relaxed">
            המוזיקה שמביאה את האנרגיה של האצטדיון לבמה
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-[var(--shazamat-orange)] text-black px-8 py-4 rounded-[var(--radius-md)] font-bold text-lg hover:bg-white transition-all duration-[var(--duration-base)] min-w-[200px]">
              שמע עכשיו
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-[var(--radius-md)] font-bold text-lg hover:bg-white hover:text-black transition-all duration-[var(--duration-base)] min-w-[200px]">
              ההופעה הבאה
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
