import { z } from "zod";

export const SPRITE_LAYERS = [
  "body",
  "pants",
  "shirt",
  "hair",
  "accessory",
  "instrument",
  "expression",
] as const;

export type SpriteLayer = (typeof SPRITE_LAYERS)[number];

export const SpriteLayerSchema = z.enum(SPRITE_LAYERS);

export const SpritePartSchema = z.object({
  id: z.string().min(1),
  layer: SpriteLayerSchema,
  file: z.string().min(1),
  label: z.string().optional(),
});

export type SpritePart = z.infer<typeof SpritePartSchema>;

export const SceneSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  label: z.string().optional(),
});

export type Scene = z.infer<typeof SceneSchema>;

export const SpriteCatalogSchema = z.object({
  parts: z.array(SpritePartSchema),
  scenes: z.array(SceneSchema),
  memberPortraits: z.record(z.string(), z.string()),
  gridSize: z.number().default(64),
  scale: z.number().default(4),
});

export type SpriteCatalog = z.infer<typeof SpriteCatalogSchema>;

export const SpriteLoadoutSchema = z.object({
  body: z.string().optional(),
  pants: z.string().optional(),
  shirt: z.string().optional(),
  hair: z.string().optional(),
  accessories: z.array(z.string()).default([]),
  instrument: z.string().optional(),
  expression: z.string().optional(),
});

export type SpriteLoadout = z.infer<typeof SpriteLoadoutSchema>;
