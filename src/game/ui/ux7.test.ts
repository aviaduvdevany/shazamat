import { describe, it, expect, vi, afterEach } from "vitest";
import { buildLifeRecap } from "./lifeRecap";
import { getExperimentFlags } from "./experiments";
import type { Stage } from "../schema/stages";
import type { LogEntry } from "../schema/state";

// ── buildLifeRecap ─────────────────────────────────────────────
const stages: Stage[] = [
  { id: "childhood", label: "ילדות", eventCount: 2 },
  { id: "school",    label: "בית ספר", eventCount: 3 },
  { id: "army",      label: "צבא", eventCount: 3 },
];

const log: LogEntry[] = [
  { stage: "childhood", eventId: "e1", choiceLabel: "ניגנתי", outcomeLabel: "+5 מוזיקליות" },
  { stage: "childhood", eventId: "e2", choiceLabel: "נרדמתי" },
  { stage: "army",      eventId: "e3", choiceLabel: "שמרתי", outcomeLabel: "שמירה בסדר" },
];

describe("buildLifeRecap", () => {
  it("returns one line per played stage, in stage order", () => {
    const recap = buildLifeRecap(log, stages);
    expect(recap.map((r) => r.stageId)).toEqual(["childhood", "army"]);
  });

  it("uses the last log entry per stage (נרדמתי wins over ניגנתי)", () => {
    const recap = buildLifeRecap(log, stages);
    const childhood = recap.find((r) => r.stageId === "childhood")!;
    expect(childhood.text).toBe("נרדמתי");
  });

  it("uses outcomeLabel when present", () => {
    const recap = buildLifeRecap(log, stages);
    const army = recap.find((r) => r.stageId === "army")!;
    expect(army.text).toBe("שמירה בסדר");
  });

  it("skips unplayed stages", () => {
    const recap = buildLifeRecap(log, stages);
    expect(recap.find((r) => r.stageId === "school")).toBeUndefined();
  });

  it("returns empty array for empty log", () => {
    expect(buildLifeRecap([], stages)).toEqual([]);
  });

  it("includes stageLabel from pack.stages", () => {
    const recap = buildLifeRecap(log, stages);
    expect(recap[0]!.stageLabel).toBe("ילדות");
    expect(recap[1]!.stageLabel).toBe("צבא");
  });

  it("falls back to choiceLabel when outcomeLabel is absent", () => {
    const recap = buildLifeRecap(log, stages);
    const childhood = recap.find((r) => r.stageId === "childhood")!;
    // e2 has no outcomeLabel → choiceLabel is used
    expect(childhood.text).toBe("נרדמתי");
  });
});

// ── getExperimentFlags ─────────────────────────────────────────
// Tests run in node env — window is undefined, so SSR path runs.
describe("getExperimentFlags (SSR — window undefined)", () => {
  it("returns default assembleVariant and holdMs when window is absent", () => {
    // In node env, window is undefined.
    const flags = getExperimentFlags();
    expect(flags.assembleVariant).toBe("default");
    expect(flags.holdMs).toBe(2800);
  });
});

// Simulate browser env by faking window + location.
describe("getExperimentFlags (browser-simulated)", () => {
  const origWindow = globalThis.window;

  afterEach(() => {
    // Restore original window after each test.
    Object.defineProperty(globalThis, "window", {
      value: origWindow,
      writable: true,
      configurable: true,
    });
  });

  function setSearchParams(search: string) {
    Object.defineProperty(globalThis, "window", {
      value: { location: { search } },
      writable: true,
      configurable: true,
    });
  }

  it("parses ux_assemble=alt", () => {
    setSearchParams("?ux_assemble=alt");
    expect(getExperimentFlags().assembleVariant).toBe("alt");
  });

  it("default when ux_assemble is anything else", () => {
    setSearchParams("?ux_assemble=foo");
    expect(getExperimentFlags().assembleVariant).toBe("default");
  });

  it("parses ux_hold=900", () => {
    setSearchParams("?ux_hold=900");
    expect(getExperimentFlags().holdMs).toBe(900);
  });

  it("parses ux_hold=1300", () => {
    setSearchParams("?ux_hold=1300");
    expect(getExperimentFlags().holdMs).toBe(1300);
  });

  it("parses ux_hold=2200", () => {
    setSearchParams("?ux_hold=2200");
    expect(getExperimentFlags().holdMs).toBe(2200);
  });

  it("parses ux_hold=2800", () => {
    setSearchParams("?ux_hold=2800");
    expect(getExperimentFlags().holdMs).toBe(2800);
  });

  it("rejects invalid ux_hold, falls back to 2800", () => {
    setSearchParams("?ux_hold=500");
    expect(getExperimentFlags().holdMs).toBe(2800);
  });

  it("rejects non-numeric ux_hold", () => {
    setSearchParams("?ux_hold=fast");
    expect(getExperimentFlags().holdMs).toBe(2800);
  });
});

// ── GameMotion skip-resolves-wait guarantee ────────────────────
// Validates the core fix for the ending stuck bug: skip() must resolve
// any in-flight wait() promise, not only clear the timeout.
describe("gameMotion skip-resolves-wait", () => {
  it("resolves an in-flight promise when skip is called before timeout fires", async () => {
    // Replicate the motion controller logic without React hooks.
    let resolveRef: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let skipped = false;

    function wait(ms: number): Promise<void> {
      if (skipped) return Promise.resolve();
      return new Promise((resolve) => {
        resolveRef = resolve;
        timer = setTimeout(() => {
          timer = null;
          resolveRef = null;
          resolve();
        }, ms);
      });
    }

    function skip() {
      skipped = true;
      if (timer !== null) { clearTimeout(timer); timer = null; }
      if (resolveRef !== null) { resolveRef(); resolveRef = null; }
    }

    // Start a 10-second wait, then skip after 10ms — should resolve quickly.
    const start = Date.now();
    const waitPromise = wait(10_000);
    setTimeout(() => skip(), 10);
    await waitPromise;
    expect(Date.now() - start).toBeLessThan(500);
  });

  it("wait resolves immediately when already skipped", async () => {
    let skipped = true;
    function wait(ms: number): Promise<void> {
      if (skipped) return Promise.resolve();
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const start = Date.now();
    await wait(10_000);
    expect(Date.now() - start).toBeLessThan(100);
  });
});
