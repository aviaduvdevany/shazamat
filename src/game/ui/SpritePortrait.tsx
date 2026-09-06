"use client";

import { useRef, useState, useEffect } from "react";
import type { SpriteLoadout } from "../schema/sprites";
import type { SpriteCatalog } from "../schema/sprites";
import { SPRITE_LAYERS } from "../schema/sprites";

interface Props {
  loadout: SpriteLoadout;
  catalog: SpriteCatalog;
  scene?: string;
}

/**
 * UX-3: Dual-layer scene crossfade.
 *
 * When `scene` changes we keep the outgoing scene visible as it fades out
 * (`.game-scene.is-exiting`) while the new scene fades in (`.game-scene`).
 * Duration is `--g-t-slow` (320ms). Reduced-motion: instant swap, no travel.
 */
export function SpritePortrait({ loadout, catalog, scene }: Props) {
  // Track previous scene so we can show both layers during the crossfade.
  const prevSceneRef = useRef<string | undefined>(undefined);
  const [exitingScene, setExitingScene] = useState<string | undefined>(undefined);

  useEffect(() => {
    const prev = prevSceneRef.current;
    if (prev !== scene) {
      // Start exit animation on the outgoing scene.
      if (prev !== undefined) {
        setExitingScene(prev);
        // Clear exiting layer after transition duration (320ms + small buffer).
        const t = setTimeout(() => setExitingScene(undefined), 400);
        return () => clearTimeout(t);
      }
      prevSceneRef.current = scene;
    }
  }, [scene]);

  // Keep prevSceneRef current after render without stale closure.
  useEffect(() => {
    prevSceneRef.current = scene;
  }, [scene]);

  const sceneDef = scene ? catalog.scenes.find((s) => s.id === scene) : null;
  const exitingSceneDef = exitingScene
    ? catalog.scenes.find((s) => s.id === exitingScene)
    : null;

  function partFile(layer: string, partId: string | undefined): string | null {
    if (!partId) return null;
    const part = catalog.parts.find((p) => p.id === partId && p.layer === layer);
    return part ? `/${part.file}` : null;
  }

  return (
    <div className="game-viewport">
      {/* Outgoing scene — fades out during crossfade */}
      {exitingSceneDef && (
        <div
          className="game-scene is-exiting"
          style={{ backgroundImage: `url(/${exitingSceneDef.file})` }}
          aria-hidden
        />
      )}

      {/* Incoming / current scene */}
      {sceneDef && (
        <div
          className="game-scene"
          key={scene}
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
