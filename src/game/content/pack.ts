import type { ContentPack } from "../schema/pack";
import { members } from "./members";
import { stats } from "./stats";
import { stages } from "./stages";
import { spriteCatalog } from "./sprites";
import { sfxCatalog } from "./sfx";

// Events
import { firstInstrumentEvent } from "./events/childhood/first-instrument";
import { talentShowEvent } from "./events/childhood/talent-show";
import { bandTryoutEvent } from "./events/school/band-tryout";
import { musicClassEvent } from "./events/school/music-class";

export const pack: ContentPack = {
  version: 1,
  members,
  stats,
  stages,
  events: [
    firstInstrumentEvent,
    talentShowEvent,
    bandTryoutEvent,
    musicClassEvent,
  ],
  sprites: spriteCatalog,
  sfx: sfxCatalog,
};
