/**
 * Single source of truth for every sprite asset in the art bible (sprite-guide.md §8).
 *
 * "status" = disk state of the PROMOTED file in public/game/:
 *   REPLACE — a placeholder already exists; overwrite it
 *   NEW     — no file yet; promote creates it + adds a catalog row
 *
 * "batch" = generation priority (A → ship, B → scars, C → color extras)
 *
 * "model" = which PixelLab endpoint to use by default:
 *   pixen    — POST /create-image-pixen  (sync, fast, 64×64 / 96×96)
 *   pixflux  — POST /create-image-pixflux (sync, scenes 160×144)
 *   style    — POST /generate-with-style-v2 (async, style-locked follow-up)
 *   inpaint  — POST /inpaint-v3 (async, layer extraction from a body)
 *   photo    — POST /image-to-pixelart-pro (async, portrait from ref photo)
 *
 * "styleRef" = id of the asset whose approved processed.png must be used as style lock.
 */

export type AssetFamily =
  | "body"
  | "pants"
  | "shirt"
  | "hair"
  | "expression"
  | "accessory"
  | "instrument"
  | "scene"
  | "portrait";

export type AssetBatch = "A" | "B" | "C";
export type AssetStatus = "REPLACE" | "NEW";
export type AssetModel = "pixen" | "pixflux" | "style" | "inpaint" | "photo";

export interface LabAsset {
  id: string;
  family: AssetFamily;
  batch: AssetBatch;
  diskStatus: AssetStatus;
  /** Exact canvas in pixels [width, height] */
  canvas: [number, number];
  /** Destination path relative to public/ */
  destPath: string;
  /** One-line prompt seed from sprite-guide §8 */
  promptSeed: string;
  model: AssetModel;
  /** id of approved asset to use as style_image or inpaint base */
  styleRef?: string;
  /** SpriteLayer from sprites schema — undefined for scenes/portraits */
  layer?: string;
  /** If true, transparent background */
  noBackground: boolean;
}

export const INVENTORY: LabAsset[] = [
  // ── 8.1 Bodies ───────────────────────────────────────────────────────────
  {
    id: "body-child",
    family: "body",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/body/body-child.png",
    promptSeed:
      "Age 8 Israeli boy, big head, short legs, dark briefs + undershirt, cheap sneakers, bald scalp, neutral face, arms at sides",
    model: "pixen",
    layer: "body",
    noBackground: true,
  },
  {
    id: "body-teen",
    family: "body",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/body/body-teen.png",
    promptSeed:
      "Age 16 Israeli teen, lanky, awkward, dark briefs, same sneakers worn down, bald scalp, same face aged up",
    model: "style",
    styleRef: "body-adult",
    layer: "body",
    noBackground: true,
  },
  {
    id: "body-soldier",
    family: "body",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/body/body-soldier.png",
    promptSeed:
      "Age 19 Israeli soldier, broader shoulders, upright, same underwear rule, combat boots olive-brown, bald scalp",
    model: "style",
    styleRef: "body-adult",
    layer: "body",
    noBackground: true,
  },
  {
    id: "body-adult",
    family: "body",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/body/body-adult.png",
    promptSeed:
      "Age 25-30 Israeli man, settled stance, same face, dark socks + simple black shoes, bald scalp, front facing",
    model: "pixen",
    layer: "body",
    noBackground: true,
  },

  // ── 8.2 Pants ─────────────────────────────────────────────────────────────
  {
    id: "pants-shorts",
    family: "pants",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/pants/pants-shorts.png",
    promptSeed:
      "Kid soccer shorts, dusty blue-gray, sitting on child hips, transparent above waist",
    model: "inpaint",
    styleRef: "body-child",
    layer: "pants",
    noBackground: true,
  },
  {
    id: "pants-jeans",
    family: "pants",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/pants/pants-jeans.png",
    promptSeed:
      "Teen/adult blue jeans #3A4A6A, simple, slightly too long, transparent above waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "pants",
    noBackground: true,
  },
  {
    id: "pants-army",
    family: "pants",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/pants/pants-army.png",
    promptSeed:
      "IDF olive trousers, straight, bloused onto boots, transparent above waist",
    model: "inpaint",
    styleRef: "body-soldier",
    layer: "pants",
    noBackground: true,
  },
  {
    id: "pants-travel",
    family: "pants",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/pants/pants-travel.png",
    promptSeed:
      "Ridiculous backpacker pants, faded maroon or dirty linen, one cargo pocket, transparent above waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "pants",
    noBackground: true,
  },
  {
    id: "pants-casual",
    family: "pants",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/pants/pants-casual.png",
    promptSeed:
      "Black cheap chinos, Tel Aviv bartender energy, transparent above waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "pants",
    noBackground: true,
  },
  {
    id: "pants-stage",
    family: "pants",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/pants/pants-stage.png",
    promptSeed:
      "Tight black stage jeans, 1px orange stitch as the only accent, transparent above waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "pants",
    noBackground: true,
  },

  // ── 8.3 Shirts ────────────────────────────────────────────────────────────
  {
    id: "shirt-basic",
    family: "shirt",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-basic.png",
    promptSeed:
      "Dirty-white sand tee #D4C8B8, no print, slightly too big, transparent below waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-band",
    family: "shirt",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-band.png",
    promptSeed:
      "Black tee, tiny unreadable white band mark not a real logo, teenage metal energy, transparent below waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-army-nahal",
    family: "shirt",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-army-nahal.png",
    promptSeed:
      "IDF olive shirt, small dull unit tag, no yellow, transparent below waist",
    model: "inpaint",
    styleRef: "body-soldier",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-army-golani",
    family: "shirt",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-army-golani.png",
    promptSeed:
      "Same IDF olive shirt as nahal, one Golani yellow #D4A01A tag on the chest, transparent below waist",
    model: "inpaint",
    styleRef: "body-soldier",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-travel",
    family: "shirt",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-travel.png",
    promptSeed:
      "Sun-faded tank or open shirt, backpacker, a bit stupid, transparent below waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-wolt",
    family: "shirt",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-wolt.png",
    promptSeed:
      "Teal-cyan courier shirt / light jacket #00C2B8, food-bag strap hint on one shoulder, transparent below waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-hitech",
    family: "shirt",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-hitech.png",
    promptSeed:
      "Pale button-down or navy polo, the I still have a job shirt, transparent below waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-musician",
    family: "shirt",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-musician.png",
    promptSeed:
      "Black faded tee, nothing printed, career musician default, transparent below waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "shirt",
    noBackground: true,
  },
  {
    id: "shirt-shazamat",
    family: "shirt",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/shirt/shirt-shazamat.png",
    promptSeed:
      "Black tee, tiny white shin-like mark, one orange #DB7738 hem tick, official merch energy without using real logo, transparent below waist",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "shirt",
    noBackground: true,
  },

  // ── 8.4 Hair ──────────────────────────────────────────────────────────────
  {
    id: "hair-child",
    family: "hair",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/hair/hair-child.png",
    promptSeed:
      "Messy dark kid hair, slightly too long in front, paint only hair pixels in the scalp region",
    model: "inpaint",
    styleRef: "body-child",
    layer: "hair",
    noBackground: true,
  },
  {
    id: "hair-short",
    family: "hair",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/hair/hair-short.png",
    promptSeed:
      "Simple dark short hair, teen and adult default, paint only hair pixels in the scalp region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "hair",
    noBackground: true,
  },
  {
    id: "hair-buzz",
    family: "hair",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/hair/hair-buzz.png",
    promptSeed:
      "Army buzz cut, scalp shows through, 2-3 pixel dark stubble, paint only hair pixels in the scalp region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "hair",
    noBackground: true,
  },
  {
    id: "hair-grown",
    family: "hair",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/hair/hair-grown.png",
    promptSeed:
      "Grown-out trip hair, a bit greasy, still dark, paint only hair pixels in the scalp region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "hair",
    noBackground: true,
  },

  // ── 8.5 Expressions ───────────────────────────────────────────────────────
  {
    id: "expression-neutral",
    family: "expression",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/expression/expression-neutral.png",
    promptSeed:
      "Paint face only: flat closed mouth, two-pixel calm eyes, inpaint only the small face region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "expression",
    noBackground: true,
  },
  {
    id: "expression-happy",
    family: "expression",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/expression/expression-happy.png",
    promptSeed:
      "Paint face only: small grin, squinted happy eyes, inpaint only the small face region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "expression",
    noBackground: true,
  },
  {
    id: "expression-worried",
    family: "expression",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/expression/expression-worried.png",
    promptSeed:
      "Paint face only: tight mouth, inner brows raised, worried look, inpaint only the small face region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "expression",
    noBackground: true,
  },
  {
    id: "expression-shocked",
    family: "expression",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/expression/expression-shocked.png",
    promptSeed:
      "Paint face only: round open mouth, wide round eyes, shocked look, inpaint only the small face region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "expression",
    noBackground: true,
  },
  {
    id: "expression-smug",
    family: "expression",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/expression/expression-smug.png",
    promptSeed:
      "Paint face only: half-lidded eyes, tiny smirk, smug look, inpaint only the small face region",
    model: "inpaint",
    styleRef: "body-adult",
    layer: "expression",
    noBackground: true,
  },

  // ── 8.6 Accessories ───────────────────────────────────────────────────────
  {
    id: "accessory-band-patch",
    family: "accessory",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-band-patch.png",
    promptSeed:
      "Small cloth patch on the left chest / sleeve area, not a full shirt, sparse overlay only",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },
  {
    id: "accessory-drumsticks",
    family: "accessory",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-drumsticks.png",
    promptSeed:
      "Pair of drumsticks in the back pocket or one hand, generic not drummer-ending, sparse overlay",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },
  {
    id: "accessory-backpack",
    family: "accessory",
    batch: "A",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-backpack.png",
    promptSeed:
      "Backpack shoulder straps + side pouches only, olive/dust, front view, not full-body redraw",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },
  {
    id: "accessory-dog-tags",
    family: "accessory",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-dog-tags.png",
    promptSeed: "Tiny chain + two dog tags on the chest, sparse overlay",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },
  {
    id: "accessory-stupid-hat",
    family: "accessory",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-stupid-hat.png",
    promptSeed:
      "Ugly bucket hat or crooked sun hat that stays forever, sparse overlay on head",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },
  {
    id: "accessory-sunglasses",
    family: "accessory",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-sunglasses.png",
    promptSeed: "Cheap black wayfarers sitting on the face box, sparse overlay",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },
  {
    id: "accessory-spray-can",
    family: "accessory",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-spray-can.png",
    promptSeed:
      "Mini spray can in one hand + magenta stain on the fingers, sparse overlay",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },
  {
    id: "accessory-headphones",
    family: "accessory",
    batch: "C",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/accessory/accessory-headphones.png",
    promptSeed:
      "Over-ear studio headphone cans, black, sit on hair, sparse overlay",
    model: "pixen",
    layer: "accessory",
    noBackground: true,
  },

  // ── 8.7 Instruments ───────────────────────────────────────────────────────
  {
    id: "instrument-guitar-small",
    family: "instrument",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/instrument/instrument-guitar-small.png",
    promptSeed:
      "3/4 kid acoustic guitar, too big for a child, cheap wood, held across body, silhouette readable at 64px",
    model: "pixen",
    layer: "instrument",
    noBackground: true,
  },
  {
    id: "instrument-guitar",
    family: "instrument",
    batch: "B",
    diskStatus: "NEW",
    canvas: [64, 64],
    destPath: "game/sprites/instrument/instrument-guitar.png",
    promptSeed:
      "Adult electric or beaten acoustic guitar, generic not a famous model, held across body",
    model: "pixen",
    layer: "instrument",
    noBackground: true,
  },
  {
    id: "instrument-bass",
    family: "instrument",
    batch: "A",
    diskStatus: "REPLACE",
    canvas: [64, 64],
    destPath: "game/sprites/instrument/instrument-bass.png",
    promptSeed:
      "Longer-neck bass silhouette, catalog / ending support only not equipped mid-run",
    model: "pixen",
    layer: "instrument",
    noBackground: true,
  },

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

  // ── 8.10 HUD icons (Batch C) ──────────────────────────────────────────────
  {
    id: "stat-musicianship",
    family: "accessory",
    batch: "C",
    diskStatus: "NEW",
    canvas: [16, 16],
    destPath: "game/ui/stat-musicianship.png",
    promptSeed:
      "Tiny pixel guitar, orange #DB7738 on transparency, 16x16",
    model: "pixen",
    noBackground: true,
  },
  {
    id: "stat-swag",
    family: "accessory",
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
    family: "accessory",
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
