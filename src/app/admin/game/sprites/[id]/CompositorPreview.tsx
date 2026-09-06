"use client";

import { useMemo } from "react";
import type { AssetFamily } from "@/game/sprites/lab/inventory";

/**
 * Live paper-doll compositor.
 *
 * Shows the selected asset layer composited over the current live sprites
 * from public/game/ so you can judge how it looks in context.
 *
 * Layer order (bottom → top):
 *   body → pants → shirt → hair → instrument → expression → accessories
 */

const LIVE_SPRITE_BASE = "/game/sprites";
const LIVE_PARTS: Record<string, string> = {
  body: `${LIVE_SPRITE_BASE}/body/body-adult.png`,
  pants: `${LIVE_SPRITE_BASE}/pants/pants-jeans.png`,
  shirt: `${LIVE_SPRITE_BASE}/shirt/shirt-basic.png`,
  hair: `${LIVE_SPRITE_BASE}/hair/hair-short.png`,
  expression: `${LIVE_SPRITE_BASE}/expression/expression-neutral.png`,
  instrument: "",
  accessory: "",
};

const LAYER_ORDER = [
  "body", "pants", "shirt", "hair", "instrument", "expression", "accessory",
];

interface Props {
  assetId: string;
  family: AssetFamily;
  layer?: string;
  processedPngUrl: string;
}

export function CompositorPreview({ assetId, family, layer, processedPngUrl }: Props) {
  const scale = 4;
  const size = 64;

  const layers = useMemo(() => {
    const targetLayer = layer ?? family;
    return LAYER_ORDER.map((l) => {
      // Replace the layer under review with the candidate
      if (l === targetLayer) {
        return { layer: l, src: processedPngUrl, isCandidate: true };
      }
      const src = LIVE_PARTS[l];
      if (!src) return null;
      return { layer: l, src, isCandidate: false };
    }).filter(Boolean) as { layer: string; src: string; isCandidate: boolean }[];
  }, [layer, family, processedPngUrl]);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
      {/* Character stack */}
      <div
        className="relative mx-auto"
        style={{ width: size * scale, height: size * scale }}
      >
        {layers.map((l) => (
          <div
            key={l.layer}
            className="absolute inset-0"
            style={{
              outline: l.isCandidate ? "1px solid rgba(251,146,60,0.6)" : undefined,
            }}
          >
            <img
              src={l.src}
              alt={l.layer}
              width={size * scale}
              height={size * scale}
              style={{
                imageRendering: "pixelated",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-zinc-600">
        Orange outline = candidate layer
      </p>
    </div>
  );
}
