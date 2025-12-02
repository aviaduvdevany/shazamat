"use client";

import React, { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";

interface VideoBackgroundProps {
  onReady?: () => void;
}

export default function VideoBackground({ onReady }: VideoBackgroundProps) {
  const [isReady, setIsReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Initialize Vimeo Player API
    const player = new Player(iframe);
    playerRef.current = player;

    // Listen for 'loaded' event - fires when video is ready to play
    const handleLoaded = () => {
      if (!isReady) {
        setIsReady(true);
        onReady?.();
      }
    };

    // Also listen for 'play' event as a backup
    const handlePlay = () => {
      if (!isReady) {
        setIsReady(true);
        onReady?.();
      }
    };

    player.on("loaded", handleLoaded);
    player.on("play", handlePlay);

    return () => {
      player.off("loaded", handleLoaded);
      player.off("play", handlePlay);
    };
  }, [isReady, onReady]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
    >
      <iframe
        ref={iframeRef}
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
  );
}
