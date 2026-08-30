"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import HeroImageFallback from "./HeroImageFallback";

const VideoBackground = dynamic(() => import("./VideoBackground"), {
  ssr: false,
  loading: () => null,
});

export default function HeroMedia() {
  const [videoReady, setVideoReady] = useState(false);
  // Start false so SSR and initial mobile paint never include the iframe.
  // Only after the client confirms a ≥768 px viewport does VideoBackground mount.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {/* Fallback image — always visible on mobile; fades out on desktop when video loads */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          videoReady && isDesktop ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <HeroImageFallback />
      </div>

      {/* Vimeo video — only mounted on desktop (matchMedia gate prevents mobile iframe load) */}
      {isDesktop && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Suspense fallback={null}>
            <VideoBackground onReady={() => setVideoReady(true)} />
          </Suspense>
        </div>
      )}
    </>
  );
}
