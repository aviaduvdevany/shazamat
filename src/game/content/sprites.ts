import type { SpriteCatalog } from "../schema/sprites";
import { MEMBER_IDS } from "../schema/members";

export const spriteCatalog: SpriteCatalog = {
  gridSize: 64,
  scale: 4,

  looks: [
    { id: "look-child", file: "game/sprites/looks/look-child.png", label: "ילד" },
    { id: "look-teen", file: "game/sprites/looks/look-teen.png", label: "נוער" },
    { id: "look-teen-band", file: "game/sprites/looks/look-teen-band.png", label: "נוער — להקה" },
    { id: "look-adult", file: "game/sprites/looks/look-adult.png", label: "מבוגר" },
    { id: "look-soldier-nahal", file: "game/sprites/looks/look-soldier-nahal.png", label: "חייל נח״ל" },
    { id: "look-soldier-golani", file: "game/sprites/looks/look-soldier-golani.png", label: "חייל גולני" },
    { id: "look-trip", file: "game/sprites/looks/look-trip.png", label: "טיול" },
    { id: "look-wolt", file: "game/sprites/looks/look-wolt.png", label: "שליח" },
    { id: "look-hitech", file: "game/sprites/looks/look-hitech.png", label: "הייטק" },
    { id: "look-career", file: "game/sprites/looks/look-career.png", label: "מוזיקאי" },
    { id: "look-shazamat", file: "game/sprites/looks/look-shazamat.png", label: "שאזאמאט" },
  ],

  scenes: [
    { id: "childhood-bedroom", file: "game/scenes/childhood-bedroom.png", label: "חדר ילדות" },
    { id: "school-stage", file: "game/scenes/school-stage.png", label: "במת בית הספר" },
    { id: "school-practice-room", file: "game/scenes/school-practice-room.png", label: "חדר חזרות" },
    { id: "school-classroom", file: "game/scenes/school-classroom.png", label: "כיתה" },
  ],

  memberPortraits: Object.fromEntries(
    MEMBER_IDS.map((id) => [id, `game/members/${id}-portrait.png`])
  ),
};
