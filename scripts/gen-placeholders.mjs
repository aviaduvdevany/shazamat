/**
 * Generates placeholder pixel-art PNG files for all game assets.
 * These are colored 64x64 blocks that prove the compositor works.
 * Replace them with real art without touching any engine code.
 *
 * Uses only the built-in `canvas` via Node's new createCanvas-free path.
 * Falls back to writing minimal valid 1×1 PNGs if canvas is unavailable.
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

// Minimal valid 1×1 transparent PNG (base64)
// Used as fallback if we can't draw — but we generate colored ones via raw PNG
function makePng(width, height, r, g, b, a = 255) {
  // We write a real PNG using pure JS (no native deps)
  return buildPng(width, height, r, g, b, a);
}

// ──────────────────────────────────────────────────────────────
// Pure-JS minimal PNG encoder (enough for solid-color sprites)
// ──────────────────────────────────────────────────────────────

function adler32(data) {
  let a = 1, b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

function crc32(data) {
  const table = crc32Table();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let _crcTable = null;
function crc32Table() {
  if (_crcTable) return _crcTable;
  _crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    _crcTable[n] = c;
  }
  return _crcTable;
}

function uint32be(n) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

function deflateNoCompress(data) {
  // zlib no-compression blocks (method 0)
  const BLOCK = 65535;
  const chunks = [];
  // zlib header
  chunks.push(0x78, 0x01);
  let offset = 0;
  while (offset < data.length) {
    const end = Math.min(offset + BLOCK, data.length);
    const block = data.slice(offset, end);
    const isLast = end >= data.length ? 1 : 0;
    chunks.push(isLast);
    const len = block.length;
    chunks.push(len & 0xff, (len >> 8) & 0xff, (~len) & 0xff, (~len >> 8) & 0xff);
    for (const b of block) chunks.push(b);
    offset = end;
  }
  // adler32 checksum
  const checksum = adler32(data);
  chunks.push(...uint32be(checksum));
  return new Uint8Array(chunks);
}

function buildPng(w, h, r, g, b, a) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];

  // IHDR
  function chunk(type, data) {
    const typeBytes = type.split("").map(c => c.charCodeAt(0));
    const crcInput = [...typeBytes, ...data];
    return [
      ...uint32be(data.length),
      ...typeBytes,
      ...data,
      ...uint32be(crc32(new Uint8Array(crcInput))),
    ];
  }

  const ihdr = chunk("IHDR", [
    ...uint32be(w), ...uint32be(h),
    8, // bit depth
    2, // colour type: RGB (we'll use RGBA later)
    0, 0, 0,
  ]);

  // Build raw scanlines (filter byte 0 + RGB)
  // Use RGBA colour type (6) for transparency support
  const ihdrRgba = chunk("IHDR", [
    ...uint32be(w), ...uint32be(h),
    8, 6, 0, 0, 0,
  ]);

  const rawRows = [];
  for (let y = 0; y < h; y++) {
    rawRows.push(0); // filter None
    for (let x = 0; x < w; x++) {
      rawRows.push(r, g, b, a);
    }
  }
  const rawData = new Uint8Array(rawRows);
  const compressed = deflateNoCompress(rawData);
  const idat = chunk("IDAT", [...compressed]);
  const iend = chunk("IEND", []);

  return Buffer.from([...sig, ...ihdrRgba, ...idat, ...iend]);
}

function write(relPath, r, g, b, a = 255, w = 64, h = 64) {
  const fullPath = join(PUBLIC, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, makePng(w, h, r, g, b, a));
}

// ── Sprite parts (64×64) ────────────────────────────────────

// Bodies
write("game/sprites/body/body-child.png",    120, 80,  40);   // brown
write("game/sprites/body/body-teen.png",     80,  120, 40);   // green-ish

// Pants
write("game/sprites/pants/pants-jeans.png",  40,  80,  160);  // blue

// Shirts
write("game/sprites/shirt/shirt-basic.png",  200, 200, 200);  // light grey
write("game/sprites/shirt/shirt-band.png",   30,  30,  30);   // near black

// Hair
write("game/sprites/hair/hair-short.png",    60,  30,  0);    // dark brown

// Accessories
write("game/sprites/accessory/accessory-band-patch.png",  220, 60,  10);  // orange
write("game/sprites/accessory/accessory-drumsticks.png",  180, 140, 80);  // wood

// Instruments
write("game/sprites/instrument/instrument-guitar-small.png", 180, 100, 20);
write("game/sprites/instrument/instrument-bass.png",         40,  40,  180);

// Expressions (tiny 16×16, displayed at same 64×64 slot)
write("game/sprites/expression/expression-neutral.png", 255, 230, 180);
write("game/sprites/expression/expression-happy.png",   255, 230, 180);
write("game/sprites/expression/expression-worried.png", 255, 230, 180);

// ── Scenes (160×144 — GameBoy-ish) ──────────────────────────

write("game/scenes/childhood-bedroom.png",    80, 60, 120, 255, 160, 144);
write("game/scenes/school-stage.png",         30, 30, 60,  255, 160, 144);
write("game/scenes/school-practice-room.png", 20, 60, 20,  255, 160, 144);
write("game/scenes/school-classroom.png",     60, 50, 30,  255, 160, 144);

// ── Member portraits (96×96) ─────────────────────────────────

const memberColors = {
  aviad:  [219, 119, 56],
  itay:   [56,  119, 219],
  nimrod: [119, 56,  219],
  shay:   [56,  219, 119],
  reef:   [219, 56,  119],
  nir:    [219, 219, 56],
  gidon:  [56,  219, 219],
};

for (const [id, [r, g, b]] of Object.entries(memberColors)) {
  write(`game/members/${id}-portrait.png`, r, g, b, 255, 96, 96);
}

console.log("Placeholder assets generated in public/game/");
