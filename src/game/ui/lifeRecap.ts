/**
 * Pure helper — build stage-ordered recap lines from a game log.
 * Extracted from LifeRecap.tsx so it can be unit-tested without JSX.
 */
import type { Stage } from "../schema/stages";
import type { LogEntry } from "../schema/state";

export interface RecapLine {
  stageId: string;
  stageLabel: string;
  text: string;
}

/**
 * Build stage-ordered recap lines from a game log.
 * One line per unique stage (last log entry per stage wins).
 */
export function buildLifeRecap(log: LogEntry[], stages: Stage[]): RecapLine[] {
  const byStage = new Map<string, LogEntry>();
  for (const entry of log) {
    byStage.set(entry.stage, entry); // last entry per stage wins
  }

  const lines: RecapLine[] = [];
  for (const stage of stages) {
    const entry = byStage.get(stage.id);
    if (!entry) continue;
    lines.push({
      stageId: stage.id,
      stageLabel: stage.label,
      text: entry.outcomeLabel ?? entry.choiceLabel,
    });
  }
  return lines;
}
