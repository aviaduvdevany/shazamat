/**
 * URL-param A/B hooks — UX-7.
 *
 * No analytics SDK. URL params are readable by Phase 3 analytics
 * once that infra lands.
 *
 * Params:
 *   ?ux_assemble=alt   — alternate email assemble copy (3-line set B)
 *   ?ux_hold=900|1300|2200 — ending hold-before-name (default 2200)
 *
 * Usage:
 *   import { getExperimentFlags } from "@/game/ui/experiments";
 *   const { assembleVariant, holdMs } = getExperimentFlags();
 *
 * Call once at component init (client-side only). Always returns
 * defaults during SSR.
 */

export interface ExperimentFlags {
  /** "default" | "alt" */
  assembleVariant: "default" | "alt";
  /**
   * Ending silence-before-name duration (ms).
   * Valid values: 900, 1300, 2200. Default: 2200.
   * Flash fires at holdMs; name fires at holdMs + 80.
   */
  holdMs: 900 | 1300 | 2200;
}

const VALID_HOLDS = new Set([900, 1300, 2200]);

export function getExperimentFlags(): ExperimentFlags {
  if (typeof window === "undefined") {
    return { assembleVariant: "default", holdMs: 2200 };
  }

  const params = new URLSearchParams(window.location.search);

  const assembleVariant: ExperimentFlags["assembleVariant"] =
    params.get("ux_assemble") === "alt" ? "alt" : "default";

  const holdRaw = parseInt(params.get("ux_hold") ?? "", 10);
  const holdMs: ExperimentFlags["holdMs"] = VALID_HOLDS.has(holdRaw)
    ? (holdRaw as 900 | 1300 | 2200)
    : 2200;

  return { assembleVariant, holdMs };
}
