"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import HeroImageFallback from "./HeroImageFallback";

const VideoBackground = dynamic(() => import("./VideoBackground"), {
  ssr: false,
  loading: () => <HeroImageFallback />,
});

export default function HeroMedia() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <>
      {/* Fallback image — always visible on mobile, fades out on desktop when video loads */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          videoReady
            ? "md:opacity-0 md:pointer-events-none opacity-100"
            : "opacity-100"
        }`}
      >
        <HeroImageFallback />
      </div>

      {/* Vimeo video — desktop only */}
      <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden">
        <Suspense fallback={null}>
          <VideoBackground onReady={() => setVideoReady(true)} />
        </Suspense>
      </div>
    </>
  );
}
