import { z } from "zod";
import { MemberSchema } from "./members";
import { StatSchema } from "./stats";
import { StageSchema } from "./stages";
import { EventSchema } from "./events";
import { SpriteCatalogSchema } from "./sprites";

export const SfxCatalogSchema = z.object({
  ids: z.array(z.string()),
  basePath: z.string().default("/game/sfx/"),
});

export type SfxCatalog = z.infer<typeof SfxCatalogSchema>;

export const ContentPackSchema = z.object({
  version: z.number().int().positive(),
  members: z.array(MemberSchema).length(7),
  stats: z.array(StatSchema).min(1),
  stages: z.array(StageSchema).min(1),
  events: z.array(EventSchema).min(1),
  sprites: SpriteCatalogSchema,
  sfx: SfxCatalogSchema,
});

export type ContentPack = z.infer<typeof ContentPackSchema>;
