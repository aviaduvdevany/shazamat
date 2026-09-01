"use client";

import { useState, type FormEvent } from "react";

interface Props {
  onSubmit: (email: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export function EmailGate({ onSubmit, error, loading }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("אנא הזינ/י כתובת מייל תקינה");
      return;
    }

    if (!consent) {
      setLocalError("יש לאשר קבלת עדכונים כדי להמשיך");
      return;
    }

    await onSubmit(email);
  }

  return (
    <div className="game-email-screen">
      <div className="game-email-headline">
        החיים שלך נוצרים.
        <br />
        צעד אחרון.
      </div>

      <div className="game-email-sub">
        נשמור את התוצאה שלך ונעדכן אותך בהמשכים ובהופעות
      </div>

      <form className="game-email-form" onSubmit={handleSubmit} noValidate>
        <input
          className="game-email-input"
          type="email"
          placeholder="המייל שלך"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLocalError("");
          }}
          required
          aria-required="true"
          aria-label="כתובת מייל"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
        />

        <label className="game-consent-row">
          <input
            className="game-consent-checkbox"
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setLocalError("");
            }}
          />
          <span className="game-consent-label">
            אני מסכימ/ה לקבל עדכונים ומידע על הופעות שאזאמאט. אפשר להסיר את
            עצמך בכל עת.
          </span>
        </label>

        {(localError || error) && (
          <div className="game-error-msg" role="alert">
            {localError || error}
          </div>
        )}

        <button
          className="game-btn game-btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "טוען..." : "התחל חיים"}
        </button>
      </form>
    </div>
  );
}
