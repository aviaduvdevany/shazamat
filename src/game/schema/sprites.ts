import { z } from "zod";

export const SpriteLookSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  label: z.string().optional(),
});

export type SpriteLook = z.infer<typeof SpriteLookSchema>;

export const SceneSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  label: z.string().optional(),
});

export type Scene = z.infer<typeof SceneSchema>;

export const SpriteCatalogSchema = z.object({
  looks: z.array(SpriteLookSchema),
  scenes: z.array(SceneSchema),
  memberPortraits: z.record(z.string(), z.string()),
  gridSize: z.number().default(64),
  scale: z.number().default(4),
});

export type SpriteCatalog = z.infer<typeof SpriteCatalogSchema>;

/** The player is one complete 64×64 PNG at a time. */
export const SpriteLoadoutSchema = z.object({
  look: z.string().optional(),
});

export type SpriteLoadout = z.infer<typeof SpriteLoadoutSchema>;
