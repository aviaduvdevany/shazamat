"use client";

import { useRef, useState, useEffect } from "react";
import type { SpriteLoadout } from "../schema/sprites";
import type { SpriteCatalog } from "../schema/sprites";

interface Props {
  loadout: SpriteLoadout;
  catalog: SpriteCatalog;
  scene?: string;
}

/**
 * UX-3: Dual-layer scene crossfade + a single complete look PNG.
 *
 * When `scene` changes we keep the outgoing scene visible as it fades out
 * (`.game-scene.is-exiting`) while the new scene fades in (`.game-scene`).
 * Duration is `--g-t-slow` (320ms). Reduced-motion: instant swap, no travel.
 */
export function SpritePortrait({ loadout, catalog, scene }: Props) {
  const prevSceneRef = useRef<string | undefined>(undefined);
  const [exitingScene, setExitingScene] = useState<string | undefined>(undefined);

  useEffect(() => {
    const prev = prevSceneRef.current;
    if (prev !== scene) {
      if (prev !== undefined) {
        setExitingScene(prev);
        const t = setTimeout(() => setExitingScene(undefined), 400);
        return () => clearTimeout(t);
      }
      prevSceneRef.current = scene;
    }
  }, [scene]);

  useEffect(() => {
    prevSceneRef.current = scene;
  }, [scene]);

  const sceneDef = scene ? catalog.scenes.find((s) => s.id === scene) : null;
  const exitingSceneDef = exitingScene
    ? catalog.scenes.find((s) => s.id === exitingScene)
    : null;

  const look = loadout.look
    ? catalog.looks.find((l) => l.id === loadout.look)
    : undefined;

  return (
    <div className="game-viewport">
      {exitingSceneDef && (
        <div
          className="game-scene is-exiting"
          style={{ backgroundImage: `url(/${exitingSceneDef.file})` }}
          aria-hidden
        />
      )}

      {sceneDef && (
        <div
          className="game-scene"
          key={scene}
          style={{ backgroundImage: `url(/${sceneDef.file})` }}
          aria-hidden
        />
      )}

      <div className="game-sprite-wrapper" aria-label="דמות שחקן">
        {look && (
          <div
            className="game-sprite-layer"
            style={{ backgroundImage: `url(/${look.file})` }}
          />
        )}
      </div>
    </div>
  );
}
