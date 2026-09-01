import type { SpriteCatalog } from "../schema/sprites";
import { MEMBER_IDS } from "../schema/members";

export const spriteCatalog: SpriteCatalog = {
  gridSize: 64,
  scale: 4,

  parts: [
    // Bodies
    { id: "body-child", layer: "body", file: "game/sprites/body/body-child.png", label: "גוף ילד" },
    { id: "body-teen", layer: "body", file: "game/sprites/body/body-teen.png", label: "גוף נוער" },
    // Pants
    { id: "pants-jeans", layer: "pants", file: "game/sprites/pants/pants-jeans.png", label: "ג׳ינס" },
    // Shirts
    { id: "shirt-basic", layer: "shirt", file: "game/sprites/shirt/shirt-basic.png", label: "חולצה בסיסית" },
    { id: "shirt-band", layer: "shirt", file: "game/sprites/shirt/shirt-band.png", label: "חולצת להקה" },
    // Hair
    { id: "hair-short", layer: "hair", file: "game/sprites/hair/hair-short.png", label: "שיער קצר" },
    // Accessories
    { id: "accessory-band-patch", layer: "accessory", file: "game/sprites/accessory/accessory-band-patch.png", label: "טלאי להקה" },
    { id: "accessory-drumsticks", layer: "accessory", file: "game/sprites/accessory/accessory-drumsticks.png", label: "מקלות תופים" },
    // Instruments
    { id: "instrument-guitar-small", layer: "instrument", file: "game/sprites/instrument/instrument-guitar-small.png", label: "גיטרה קטנה" },
    { id: "instrument-bass", layer: "instrument", file: "game/sprites/instrument/instrument-bass.png", label: "בס" },
    // Expressions
    { id: "expression-neutral", layer: "expression", file: "game/sprites/expression/expression-neutral.png", label: "ניטרלי" },
    { id: "expression-happy", layer: "expression", file: "game/sprites/expression/expression-happy.png", label: "שמח" },
    { id: "expression-worried", layer: "expression", file: "game/sprites/expression/expression-worried.png", label: "מוטרד" },
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
