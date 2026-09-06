"use client";

/**
 * Look preview on a dim scene — the game viewport, not a paper-doll stack.
 */

const LIVE_SCENE = "/game/scenes/childhood-bedroom.png";

interface Props {
  processedPngUrl: string;
}

export function CompositorPreview({ processedPngUrl }: Props) {
  const scale = 4;
  const size = 64;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          width: size * scale,
          height: size * scale,
          background: "#0a0a0a",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${LIVE_SCENE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6,
          }}
        />
        <img
          src={processedPngUrl}
          alt="look"
          width={size * scale}
          height={size * scale}
          className="relative"
          style={{ imageRendering: "pixelated", display: "block" }}
        />
      </div>
      <p className="text-[10px] text-center text-zinc-600">
        Full look on a 60% scene
      </p>
    </div>
  );
}
