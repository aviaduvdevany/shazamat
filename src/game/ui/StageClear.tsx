"use client";

import type { Stage } from "../schema/stages";

interface Props {
  nextStage?: Stage;
  onContinue: () => void;
}

export function StageClear({ nextStage, onContinue }: Props) {
  return (
    <div className="game-stage-clear">
      <div className="game-stage-clear-label">פרק חדש מתחיל</div>
      <div className="game-stage-clear-name">
        {nextStage?.label ?? "הפרק הבא"}
      </div>
      {nextStage?.ageLabel && (
        <div style={{ fontSize: 14, color: "#888" }}>{nextStage.ageLabel}</div>
      )}
      <button className="game-btn game-btn-primary" onClick={onContinue}>
        המשך
      </button>
    </div>
  );
}
