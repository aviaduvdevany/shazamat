import React, { Suspense } from "react";
import Logo from "../ui/Logo";
import HeroMedia from "../ui/HeroMedia";
import HeroScrollArrow from "../ui/HeroScrollArrow";
import HeroCtas from "../ui/HeroCtas";
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
          <h1 className="text-[clamp(50px,8vw,120px)] font-bold mb-6 leading-none">
            <Logo width={650} height={300} variant="logo" />
          </h1>

          {/* Primary CTAs — async RSC island; Suspense reserves height to prevent CLS */}
          <Suspense fallback={<div className="h-[64px] mb-2" />}>
            <HeroCtas />
          </Suspense>

          {/* Social links — smaller, secondary */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {socialPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.name}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-110 group shadow-sm"
              >
                <img
                  src={platform.icon}
                  alt=""
                  aria-hidden="true"
                  width={18}
                  height={18}
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
