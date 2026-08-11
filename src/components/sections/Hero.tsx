import React from "react";
import Logo from "../ui/Logo";
import HeroMedia from "../ui/HeroMedia";
import HeroScrollArrow from "../ui/HeroScrollArrow";
import { socialPlatforms } from "@/data";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* Media layer — video + image fallback (client island) */}
      <HeroMedia />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay opacity-20" />

      {/* Content — fully static, no hydration needed */}
      <div className="relative z-10 container-custom text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[clamp(50px,8vw,120px)] font-bold mb-4 leading-none">
            <Logo width={650} height={300} variant="logo" />
          </h1>

          {/* Social links — use <img> directly (SVGs + one PNG, all tiny icons) */}
          <div className="flex justify-center items-center gap-3 mb-6">
            {socialPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.name}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/15 border border-white/30 hover:bg-white/25 hover:border-white/50 hover:scale-110 group shadow-sm"
              >
                <img
                  src={platform.icon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className={`object-contain transition-all duration-300 ${
                    platform.name === "YouTube"
                      ? "brightness-0 invert group-hover:brightness-100 group-hover:invert-0"
                      : "grayscale group-hover:grayscale-0"
                  }`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator arrow (client island) */}
      <HeroScrollArrow />
    </section>
  );
}
