/**
 * Single source of truth for every sprite asset in the art bible.
 *
 * Looks are complete 64×64 dressed characters — not paper-doll layers.
 * Generate look-adult first (pixen). Every other look is an edit of that
 * file (or of another look) via edit-image-pixen. Keep the full composite.
 *
 * "diskStatus" = disk state of the PROMOTED file in public/game/:
 *   REPLACE — a placeholder already exists; overwrite it
 *   NEW     — no file yet; promote creates it + adds a catalog row
 *
 * "batch" = generation priority (A → ship, B → job/stage flavor, C → extras)
 *
 * "model" = which PixelLab endpoint to use by default:
 *   pixen   — POST /create-image-pixen (hero look, portraits, UI)
 *   pixflux — POST /create-image-pixflux (scenes)
 *   style   — POST /generate-with-style-v2 (kept for experiments; looks use edit)
 *   edit    — POST /edit-image-pixen; keep the full dressed result
 *   photo   — POST /image-to-pixelart-pro (portrait from ref photo)
 *
 * "styleRef" = id of the approved look used as the input / style lock.
 */

export type AssetFamily = "look" | "scene" | "portrait" | "ui";

export type AssetBatch = "A" | "B" | "C";
export type AssetStatus = "REPLACE" | "NEW";
export type AssetModel = "pixen" | "pixflux" | "style" | "edit" | "photo";

export interface LabAsset {
  id: string;
  family: AssetFamily;
  batch: AssetBatch;
  diskStatus: AssetStatus;
  /** Exact canvas in pixels [width, height] */
  canvas: [number, number];
  /** Destination path relative to public/ */
  destPath: string;
  /** One-line prompt seed */
  promptSeed: string;
  model: AssetModel;
  /** id of approved asset to use as style lock or edit input */
  styleRef?: string;
  /** If true, transparent background */
  noBackground: boolean;
}

function look(
  id: string,
  batch: AssetBatch,
  diskStatus: AssetStatus,
  promptSeed: string,
  model: AssetModel,
  styleRef?: string
): LabAsset {
  return {
    id,
    family: "look",
    batch,
    diskStatus,
    canvas: [64, 64],
    destPath: `game/sprites/looks/${id}.png`,
    promptSeed,
    model,
    styleRef,
    noBackground: true,
  };
}

export const INVENTORY: LabAsset[] = [
  // ── Looks ────────────────────────────────────────────────────────────────
  // Wave 1: hero adult. Approve this before anything that style-locks or edits it.
  look(
    "look-adult",
    "A",
    "REPLACE",
    "Age 25-30 Israeli man, complete dressed front-facing sprite, short dark brown hair, dirty-white sand tee #D4C8B8 slightly too big, blue jeans #3A4A6A slightly too long, dark socks and simple black shoes, Mediterranean olive-tan skin, settled stance, arms at sides, neutral Earthbound face, fully clothed, not bald, not underwear",
    "pixen"
  ),
  look(
    "look-child",
    "A",
    "REPLACE",
    "Age 8 Israeli boy, same person aged down, big head, short legs, messy dark kid hair slightly too long in front, dusty blue-gray soccer shorts, dirty-white sand tee, cheap sneakers, complete dressed front-facing sprite",
    "edit",
    "look-adult"
  ),
  look(
    "look-teen",
    "A",
    "REPLACE",
    "Age 16 Israeli teen, same person, lanky awkward, slightly too-long arms, simple dark short hair, dirty-white sand tee, blue jeans slightly too long, worn sneakers, complete dressed front-facing sprite",
    "edit",
    "look-adult"
  ),
  look(
    "look-teen-band",
    "A",
    "REPLACE",
    "Same teen, change only the shirt to a black tee with a tiny unreadable white band mark, teenage metal energy, keep face hair jeans pose and shoes",
    "edit",
    "look-teen"
  ),
  look(
    "look-soldier-nahal",
    "A",
    "REPLACE",
    "Same man as an IDF soldier age 19, olive uniform shirt and trousers, army buzz cut scalp shows through, combat boots olive-brown, small dull unit tag no yellow, broader shoulders upright, keep the same face",
    "edit",
    "look-adult"
  ),
  look(
    "look-soldier-golani",
    "A",
    "REPLACE",
    "Same soldier, add one Golani yellow #D4A01A tag on the chest, keep everything else identical",
    "edit",
    "look-soldier-nahal"
  ),
  look(
    "look-trip",
    "A",
    "REPLACE",
    "Same man as a backpacker, sun-faded tank or open shirt, faded maroon travel pants, grown-out slightly greasy dark hair, olive backpack with visible straps, a bit stupid, keep the same face",
    "edit",
    "look-adult"
  ),
  look(
    "look-wolt",
    "B",
    "REPLACE",
    "Same man, teal-cyan courier shirt / light jacket #00C2B8, food-bag strap hint on one shoulder, keep jeans hair face and pose",
    "edit",
    "look-adult"
  ),
  look(
    "look-hitech",
    "B",
    "REPLACE",
    "Same man, pale button-down or navy polo, the I still have a job shirt, keep jeans hair face and pose",
    "edit",
    "look-adult"
  ),
  look(
    "look-career",
    "A",
    "REPLACE",
    "Same man, black faded musician tee nothing printed, black cheap chinos, keep short dark hair and face",
    "edit",
    "look-adult"
  ),
  look(
    "look-shazamat",
    "A",
    "REPLACE",
    "Same man on stage, black tee with tiny white shin-like mark and one orange #DB7738 hem tick, tight black stage jeans with 1px orange stitch, keep short dark hair and face",
    "edit",
    "look-adult"
  ),

  // ── 8.8 Scenes ────────────────────────────────────────────────────────────
  {
    id: "childhood-bedroom",
    family: "scene",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [160, 144],
    destPath: "game/scenes/childhood-bedroom.png",
    promptSeed:
      "Kid room north-of-center Israel: unmade bed, one window, cheap guitar in corner, afternoon bleach light",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "childhood-kiosk",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/childhood-kiosk.png",
    promptSeed:
      "Israeli neighborhood kiosk: glass vitrine, fluorescent #E8E06A, ice-cream fridge, orange price glow, dusty pavement, this is kookilida",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "school-classroom",
    family: "scene",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [160, 144],
    destPath: "game/scenes/school-classroom.png",
    promptSeed:
      "Israeli classroom: fluorescent tubes, rows of chairs, green board dark rectangle, backpack on a chair",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "school-practice-room",
    family: "scene",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [160, 144],
    destPath: "game/scenes/school-practice-room.png",
    promptSeed:
      "School rehearsal closet: amp, chairs in a circle, cable mess, one small window, beige walls",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "school-stage",
    family: "scene",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [160, 144],
    destPath: "game/scenes/school-stage.png",
    promptSeed:
      "School auditorium: wood stage, two orange #DB7738 PAR cans, black curtains, empty chairs as dark lumps",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "school-yard",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/school-yard.png",
    promptSeed:
      "Israeli recess yard: concrete, a ball, chain fence, harsh sun, ola energy",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "school-bedroom",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/school-bedroom.png",
    promptSeed:
      "Teen bedroom 06:30: dark room, alarm clock glow, blanket lump, one sliver of morning light",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "army-base",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/army-base.png",
    promptSeed:
      "IDF base dawn: olive tents/buildings, gravel, flagpole as 1px stick, cold light",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "army-recruitment",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/army-recruitment.png",
    promptSeed:
      "Lishkat giyus: two buses side by side the choice, concrete, harsh sun, no logos on the buses",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "trip-airport",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/trip-airport.png",
    promptSeed:
      "Ben Gurion airport vibe: glass, night, one plane silhouette, orange sodium, departure hall emptiness",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "trip-hostel",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/trip-hostel.png",
    promptSeed:
      "Anywhere-abroad hostel: bunk bed, ceiling fan, cigarette pack on table, ugly curtain",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "home-apartment",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/home-apartment.png",
    promptSeed:
      "Cheap Tel Aviv flat: white walls, laundry, one window on a building shaft, noon",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "home-graffiti",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/home-graffiti.png",
    promptSeed:
      "South Tel Aviv after midnight: concrete wall, magenta #C43A6A spray, street, no readable word",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "home-studio",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/home-studio.png",
    promptSeed:
      "Night mix room: desk, audio interface, cold coffee cup, blister pack as tiny foil rectangle, lamp",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "career-backstage",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/career-backstage.png",
    promptSeed:
      "First-gig backstage wings: black curtains, orange spill from stage-right, cable, nervous empty space",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "shazamat-stage",
    family: "scene",
    batch: "A",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/shazamat-stage.png",
    promptSeed:
      "Real club stage now: dark room, orange #DB7738 wash, mic stand, crowd as a dark mass",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "night-out",
    family: "scene",
    batch: "B",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/night-out.png",
    promptSeed:
      "Friday night somewhere stupid: sodium street, a closed shutter, one neon tick",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "home-living-room",
    family: "scene",
    batch: "B",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/home-living-room.png",
    promptSeed:
      "Parents house Friday leave: couch, TV glow, quiet, basketball on the floor optional",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "home-protest",
    family: "scene",
    batch: "B",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/home-protest.png",
    promptSeed:
      "Tel Aviv protest: dumpster fire as hero shape, crowd lumps, blue-red flicker, cartoon not news footage",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "career-classroom",
    family: "scene",
    batch: "B",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/career-classroom.png",
    promptSeed:
      "Music-school hallway: lockers-as-rectangles, poster blobs, daylight",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "shazamat-rehearsal",
    family: "scene",
    batch: "B",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/shazamat-rehearsal.png",
    promptSeed:
      "Band room: seven chair-lumps, amps, daylight through a dirty window",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "phone-glow",
    family: "scene",
    batch: "B",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/phone-glow.png",
    promptSeed:
      "Near-black room, a white-blue phone rectangle glow, for Instagram / WhatsApp cards",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "trip-india",
    family: "scene",
    batch: "C",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/trip-india.png",
    promptSeed:
      "Goa 36 hours awake: night beach market, one orange bulb string, sea as a dark band",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "trip-south-america",
    family: "scene",
    batch: "C",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/trip-south-america.png",
    promptSeed:
      "Buenos Aires bus: night window, seat, passing yellow street, a book on the empty seat",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "trip-usa",
    family: "scene",
    batch: "C",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/trip-usa.png",
    promptSeed:
      "NYC shop window: luxury glass, one expensive bag silhouette, the player is outside looking in",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "trip-australia",
    family: "scene",
    batch: "C",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/trip-australia.png",
    promptSeed:
      "Bondi: huge sky, huge sea, tiny people, too big is the joke",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "trip-east-asia",
    family: "scene",
    batch: "C",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/trip-east-asia.png",
    promptSeed:
      "Tokyo side street: vending machine glow, clean pavement, quiet order",
    model: "pixflux",
    noBackground: false,
  },
  {
    id: "shazamat-wedding",
    family: "scene",
    batch: "C",
    diskStatus: "NEW",
    canvas: [160, 144],
    destPath: "game/scenes/shazamat-wedding.png",
    promptSeed:
      "Tuscany wedding: cypress + warm lights + a long table, joyful not fancy-catalog",
    model: "pixflux",
    noBackground: false,
  },

  // ── 8.9 Member portraits ──────────────────────────────────────────────────
  {
    id: "aviad-portrait",
    family: "portrait",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [96, 96],
    destPath: "game/members/aviad-portrait.png",
    promptSeed:
      "אביעד bassist: center-Israel, responsible, dark hair, calmer face, short beard, grounded not pretty-boy. Bass headstock or strap prop",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "itay-portrait",
    family: "portrait",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [96, 96],
    destPath: "game/members/itay-portrait.png",
    promptSeed:
      "איתי drummer: Kibbutz Yiftah, always late, Australia. Looser face, slightly tired, drummer shoulders. Drumstick up prop",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "nimrod-portrait",
    family: "portrait",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [96, 96],
    destPath: "game/members/nimrod-portrait.png",
    promptSeed:
      "נמרוד guitarist: also Yiftah, East Asia, guitar years in a room. Sharper more intense than Itay so they don't twin. Guitar headstock prop",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "shay-portrait",
    family: "portrait",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [96, 96],
    destPath: "game/members/shay-portrait.png",
    promptSeed:
      "שי producer: Kibbutz Gonen, Golani, India, night-studio. Tired-smart not a stage pose, the brain. Cans around neck or tiny knob/desk hint",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "reef-portrait",
    family: "portrait",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [96, 96],
    destPath: "game/members/reef-portrait.png",
    promptSeed:
      "ריף keyboardist: Kibbutz Shfayim, South America, three weddings to same woman. Warmer more romantic slightly dressed-up. Keyboard edge or ring pixel prop",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "nir-portrait",
    family: "portrait",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [96, 96],
    destPath: "game/members/nir-portrait.png",
    promptSeed:
      "ניר rapper: Alon HaGalil. GINGER hair ashkan — must read red at 96px. Punchline energy not mean. Mic or magenta spray tick prop. Use ginger #C45A2A / #E07A3A / #8A3A18",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "gidon-portrait",
    family: "portrait",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [96, 96],
    destPath: "game/members/gidon-portrait.png",
    promptSeed:
      "גדעון rapper: Kiryat Tivon, stage current, protests. Highest energy of seven, mouth slightly open or mid-shout, still tiny. Mic more motion in the hair",
    model: "pixen",
    noBackground: true,
  },

  // ── HUD icons (Batch C) ───────────────────────────────────────────────────
  {
    id: "stat-musicianship",
    family: "ui",
    batch: "C",
    diskStatus: "NEW",
    canvas: [16, 16],
    destPath: "game/ui/stat-musicianship.png",
    promptSeed: "Tiny pixel guitar, orange #DB7738 on transparency, 16x16",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "stat-swag",
    family: "ui",
    batch: "C",
    diskStatus: "NEW",
    canvas: [16, 16],
    destPath: "game/ui/stat-swag.png",
    promptSeed: "Tiny pixel sunglasses, white highlights, 16x16",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "dice",
    family: "ui",
    batch: "C",
    diskStatus: "NEW",
    canvas: [16, 16],
    destPath: "game/ui/dice.png",
    promptSeed: "3x3 pip die face, for roll choices, 16x16",
    model: "pixen",
    noBackground: true,
  },
];

/** Look up a single asset by id */
export function getAsset(id: string): LabAsset | undefined {
  return INVENTORY.find((a) => a.id === id);
}

/** Assets filtered by batch, optionally further filtered by family */
export function getBatch(
  batch: AssetBatch,
  family?: AssetFamily
): LabAsset[] {
  return INVENTORY.filter(
    (a) => a.batch === batch && (!family || a.family === family)
  );
}

/** Batch A shortcut — the "ship the game" set */
export const BATCH_A = INVENTORY.filter((a) => a.batch === "A");
