import { describe, it, expect } from "vitest";
import { createRun, selectNextEvent, applyChoice, resolveEnding, stateRng } from "./engine";
import { createRng } from "./rng";
import type { ContentPack } from "../schema/pack";
import { MEMBER_IDS } from "../schema/members";

const mockPack: ContentPack = {
  version: 1,
  members: MEMBER_IDS.map((id) => ({
    id,
    name: id,
    role: "test",
    description: "test",
    endingBlurb: "test",
    portraitId: `${id}-placeholder`,
  })),
  stats: [
    { id: "musicianship", label: "מוזיקליות", emoji: "🎸", min: 0, max: 100, initial: 10 },
    { id: "swag", label: "סוואג", emoji: "😎", min: 0, max: 100, initial: 10 },
  ],
  stages: [
    { id: "childhood", label: "ילדות", eventCount: 2 },
    { id: "school", label: "בית ספר", eventCount: 2 },
  ],
  events: [
    {
      id: "first-instrument",
      stage: "childhood",
      weight: 1,
      rarity: "common",
      oncePerRun: true,
      mood: "neutral" as const,
      kicker: "גיל 8",
      headline: "הצגת הכלי הראשון",
      body: "ראית גיטרה בפינת החדר של הדוד.",
      choices: [
        {
          id: "pick-up",
          label: "לקחת אותה",
          effects: [
            { type: "stat", id: "musicianship", delta: 5 },
            { type: "affinity", memberId: "aviad", delta: 3 },
            { type: "setFlag", key: "hadFirstInstrument", value: true },
            { type: "spriteSet", layer: "shirt", partId: "band-shirt" },
          ],
        },
        {
          id: "ignore",
          label: "להתעלם",
          effects: [{ type: "stat", id: "swag", delta: 2 }],
        },
      ],
    },
    {
      id: "roll-event",
      stage: "childhood",
      weight: 1,
      rarity: "common",
      oncePerRun: true,
      mood: "neutral" as const,
      kicker: "גיל 9",
      headline: "ניסיון מוזיקלי",
      choices: [
        {
          id: "try",
          label: "לנסות",
          roll: [
            {
              weight: 1,
              label: "הצלחת!",
              effects: [{ type: "stat", id: "musicianship", delta: 10 }],
            },
            {
              weight: 1,
              label: "נכשלת.",
              effects: [{ type: "stat", id: "swag", delta: -5 }],
            },
          ],
        },
      ],
    },
    {
      id: "school-gated",
      stage: "school",
      weight: 1,
      rarity: "common",
      oncePerRun: true,
      mood: "neutral" as const,
      kicker: "כיתה ז׳",
      headline: "רוצים להקה?",
      requires: { type: "flag", key: "hadFirstInstrument", value: true },
      choices: [
        {
          id: "yes",
          label: "כמובן",
          effects: [
            { type: "affinity", memberId: "nimrod", delta: 5 },
            { type: "affinity", memberId: "itay", delta: 5 },
          ],
        },
      ],
    },
    {
      id: "school-basic",
      stage: "school",
      weight: 1,
      rarity: "common",
      oncePerRun: true,
      mood: "neutral" as const,
      kicker: "כיתה ח׳",
      headline: "מה ללמוד?",
      choices: [
        {
          id: "music",
          label: "מוזיקה",
          effects: [{ type: "affinity", memberId: "shay", delta: 3 }],
        },
        {
          id: "math",
          label: "מתמטיקה",
          effects: [{ type: "stat", id: "swag", delta: 5 }],
        },
      ],
    },
  ],
  sprites: {
    parts: [],
    scenes: [],
    memberPortraits: Object.fromEntries(MEMBER_IDS.map((id) => [id, `/game/members/${id}-placeholder.png`])),
    gridSize: 64,
    scale: 4,
  },
  sfx: { ids: [], basePath: "/game/sfx/" },
};

describe("Engine: createRun", () => {
  it("initialises stats from pack defaults", () => {
    const state = createRun({ runId: "test-1", seed: 42, contentVersion: 1 }, mockPack);
    expect(state.stats.musicianship).toBe(10);
    expect(state.stats.swag).toBe(10);
  });

  it("initialises all 7 affinities at 0", () => {
    const state = createRun({ runId: "test-2", seed: 42, contentVersion: 1 }, mockPack);
    for (const id of MEMBER_IDS) {
      expect(state.affinities[id]).toBe(0);
    }
  });

  it("starts in playing phase at stage 0", () => {
    const state = createRun({ runId: "test-3", seed: 42, contentVersion: 1 }, mockPack);
    expect(state.phase).toBe("playing");
    expect(state.stageIndex).toBe(0);
  });
});

describe("Engine: selectNextEvent", () => {
  it("selects an event from the current stage", () => {
    const state = createRun({ runId: "test-4", seed: 42, contentVersion: 1 }, mockPack);
    const rng = stateRng(state);
    const result = selectNextEvent(state, mockPack, rng);
    expect(result.type).toBe("event");
    if (result.type === "event") {
      expect(result.event.stage).toBe("childhood");
    }
  });

  it("returns stage-clear when event count reached", () => {
    const state = createRun({ runId: "test-5", seed: 42, contentVersion: 1 }, mockPack);
    const exhausted = { ...state, eventsPlayedInStage: 99 };
    const rng = stateRng(exhausted);
    const result = selectNextEvent(exhausted, mockPack, rng);
    expect(result.type).toBe("stage-clear");
  });

  it("respects oncePerRun — does not repeat seen events if no others left", () => {
    const state = createRun({ runId: "test-6", seed: 42, contentVersion: 1 }, mockPack);
    const allSeen = { ...state, seenEventIds: ["first-instrument", "roll-event"] };
    const rng = stateRng(allSeen);
    const result = selectNextEvent(allSeen, mockPack, rng);
    // No unseen childhood events → stage-clear
    expect(result.type).toBe("stage-clear");
  });

  it("enforces requires conditions", () => {
    // school-gated requires hadFirstInstrument=true
    const state = createRun({ runId: "test-7", seed: 42, contentVersion: 1 }, mockPack);
    const schoolState = { ...state, stageIndex: 1, eventsPlayedInStage: 0, flags: {} };
    const rng = stateRng(schoolState);
    const result = selectNextEvent(schoolState, mockPack, rng);
    // school-gated must NOT appear (flag is missing)
    if (result.type === "event") {
      expect(result.event.id).not.toBe("school-gated");
    }
  });
});

describe("Engine: applyChoice", () => {
  it("applies stat delta correctly", () => {
    const state = createRun({ runId: "test-8", seed: 42, contentVersion: 1 }, mockPack);
    const rng = stateRng(state);
    const event = mockPack.events.find((e) => e.id === "first-instrument")!;
    const { state: next } = applyChoice(state, event, "pick-up", rng, mockPack);
    expect(next.stats.musicianship).toBe(15);
  });

  it("applies affinity delta", () => {
    const state = createRun({ runId: "test-9", seed: 42, contentVersion: 1 }, mockPack);
    const rng = stateRng(state);
    const event = mockPack.events.find((e) => e.id === "first-instrument")!;
    const { state: next } = applyChoice(state, event, "pick-up", rng, mockPack);
    expect(next.affinities.aviad).toBe(3);
  });

  it("sets flags", () => {
    const state = createRun({ runId: "test-10", seed: 42, contentVersion: 1 }, mockPack);
    const rng = stateRng(state);
    const event = mockPack.events.find((e) => e.id === "first-instrument")!;
    const { state: next } = applyChoice(state, event, "pick-up", rng, mockPack);
    expect(next.flags.hadFirstInstrument).toBe(true);
  });

  it("applies sprite mutation", () => {
    const state = createRun({ runId: "test-11", seed: 42, contentVersion: 1 }, mockPack);
    const rng = stateRng(state);
    const event = mockPack.events.find((e) => e.id === "first-instrument")!;
    const { state: next } = applyChoice(state, event, "pick-up", rng, mockPack);
    expect(next.sprite.shirt).toBe("band-shirt");
  });

  it("adds the event to seenEventIds", () => {
    const state = createRun({ runId: "test-12", seed: 42, contentVersion: 1 }, mockPack);
    const rng = stateRng(state);
    const event = mockPack.events.find((e) => e.id === "first-instrument")!;
    const { state: next } = applyChoice(state, event, "pick-up", rng, mockPack);
    expect(next.seenEventIds).toContain("first-instrument");
  });

  it("handles roll choices deterministically given the same seed", () => {
    const state = createRun({ runId: "test-13", seed: 1234, contentVersion: 1 }, mockPack);
    const rng1 = stateRng(state);
    const rng2 = stateRng(state);
    const event = mockPack.events.find((e) => e.id === "roll-event")!;
    const { outcomeLabel: out1 } = applyChoice(state, event, "try", rng1, mockPack);
    const { outcomeLabel: out2 } = applyChoice(state, event, "try", rng2, mockPack);
    expect(out1).toBe(out2);
  });
});

describe("Engine: resolveEnding", () => {
  it("picks the member with the highest affinity", () => {
    const state = createRun({ runId: "test-14", seed: 42, contentVersion: 1 }, mockPack);
    const dominated = { ...state, affinities: { ...state.affinities, shay: 50 } };
    const result = resolveEnding(dominated, mockPack);
    expect(result).toBe("shay");
  });
});
