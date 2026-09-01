"use client";

import type { SpriteLoadout } from "../schema/sprites";
import type { SpriteCatalog } from "../schema/sprites";
import { SPRITE_LAYERS } from "../schema/sprites";

interface Props {
  loadout: SpriteLoadout;
  catalog: SpriteCatalog;
  scene?: string;
}

export function SpritePortrait({ loadout, catalog, scene }: Props) {
  const sceneDef = scene ? catalog.scenes.find((s) => s.id === scene) : null;

  function partFile(layer: string, partId: string | undefined): string | null {
    if (!partId) return null;
    const part = catalog.parts.find((p) => p.id === partId && p.layer === layer);
    return part ? `/${part.file}` : null;
  }

  return (
    <div className="game-viewport">
      {/* Background scene */}
      {sceneDef && (
        <div
          className="game-scene"
          style={{ backgroundImage: `url(/${sceneDef.file})` }}
          aria-hidden
        />
      )}

      {/* Layered sprite compositor */}
      <div className="game-sprite-wrapper" aria-label="דמות שחקן">
        {SPRITE_LAYERS.filter((l) => l !== "accessory").map((layer) => {
          const layerMap: Record<string, string | undefined> = {
            body: loadout.body,
            pants: loadout.pants,
            shirt: loadout.shirt,
            hair: loadout.hair,
            instrument: loadout.instrument,
            expression: loadout.expression,
          };
          const partId = layerMap[layer];
          const file = partFile(layer, partId);
          if (!file) return null;
          return (
            <div
              key={layer}
              className="game-sprite-layer"
              style={{ backgroundImage: `url(${file})` }}
            />
          );
        })}

        {/* Accessories — stacked on top */}
        {(loadout.accessories ?? []).map((accId) => {
          const file = partFile("accessory", accId);
          if (!file) return null;
          return (
            <div
              key={accId}
              className="game-sprite-layer"
              style={{ backgroundImage: `url(${file})` }}
            />
          );
        })}
      </div>
    </div>
  );
}
