"use client";

interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  return (
    <div className="game-title-screen">
      <div className="game-title-band">שאזאמאט</div>

      <div className="game-title-headline">החיים</div>

      <div className="game-title-subtitle">
        חיה חיים שלמים כמוזיקאי ישראלי
        <br />
        וגלה לאיזה חבר בשאזאמאט הפכת
      </div>

      <button className="game-btn game-btn-primary" onClick={onStart}>
        התחל חיים
      </button>

      <div style={{ fontSize: 11, color: "#444", marginTop: 8 }}>
        משחק בעברית · ~5 דקות · חינמי
      </div>
    </div>
  );
}
