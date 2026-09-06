"use client";

interface Props {
  onStart: () => void;
  /** True while the 200ms exit-to-email overlap is running. */
  exiting?: boolean;
}

export function TitleScreen({ onStart, exiting = false }: Props) {
  return (
    <div className={`game-title-screen${exiting ? " is-exiting" : ""}`}>
      <div className="game-title-band">שאזאמאט</div>
      <div className="game-title-headline">החיים</div>
      <div className="game-title-subtitle">
        חיה חיים שלמים כמוזיקאי ישראלי
        <br />
        וגלה לאיזה חבר בשאזאמאט הפכת
      </div>
      <button
        className="game-btn game-btn-primary game-title-cta"
        onClick={onStart}
        disabled={exiting}
      >
        התחל חיים
      </button>
      <div className="game-title-meta">
        משחק בעברית · ~5 דקות · חינמי
      </div>
    </div>
  );
}
