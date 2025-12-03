"use client";

import React, { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";

interface VideoBackgroundProps {
  onReady?: () => void;
}

export default function VideoBackground({ onReady }: VideoBackgroundProps) {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches && playerRef.current) {
        playerRef.current.pause();
        setIsPlaying(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    player.on("loaded", handleLoaded);
    player.on("play", handlePlay);
    player.on("pause", handlePause);

    // Pause if user prefers reduced motion
    if (prefersReducedMotion) {
      player.pause();
      setIsPlaying(false);
    }

    return () => {
      player.off("loaded", handleLoaded);
      player.off("play", handlePlay);
      player.off("pause", handlePause);
    };
  }, [isReady, onReady, prefersReducedMotion]);

  const handleTogglePlay = async () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        await playerRef.current.pause();
        setIsPlaying(false);
      } else {
        await playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling video playback:", error);
    }
  };

  // Don't render video if user prefers reduced motion
  if (prefersReducedMotion) {
    return null;
  }

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
        title="סרטון רקע - שאזאמאט"
        aria-label="סרטון רקע של הלהקה"
      />
      {/* Pause/Play Control Button */}
      <button
        onClick={handleTogglePlay}
        className="absolute bottom-4 left-4 z-20 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--shazamat-orange)]"
        aria-label={isPlaying ? "עצור סרטון רקע" : "הפעל סרטון רקע"}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
