/**
 * Deterministic seeded RNG — mulberry32 algorithm.
 * Math.random() is NEVER used inside the engine.
 */
export function createRng(seed: number, cursor: number = 0) {
  let state = seed + cursor;

  function next(): number {
    state += 0x6d2b79f5;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0xffffffff;
  }

  function nextInt(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(next() * arr.length)];
  }

  function weightedPick<T>(items: { weight: number; value: T }[]): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = next() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item.value;
    }
    return items[items.length - 1].value;
  }

  return { next, nextInt, pick, weightedPick };
}

export type Rng = ReturnType<typeof createRng>;
