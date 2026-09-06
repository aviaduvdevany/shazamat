"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { getExperimentFlags } from "./experiments";

interface Props {
  onSubmit: (email: string) => Promise<void>;
  error?: string;
  /** True while the assemble theater is running (hides form, shows lines). */
  assembling?: boolean;
  /** 0–3: how many assemble lines are currently visible. */
  assemblePhase?: 0 | 1 | 2 | 3;
  /** True when the last line should show the ticking indicator. */
  assembleTicking?: boolean;
  /** True when localStorage shows a prior run on this device. */
  returning?: boolean;
  /** Previously used email address (from localStorage). Prefills the input. */
  defaultEmail?: string;
}

const ASSEMBLE_LINES_DEFAULT = ["מוצא: ██░░", "כלי ראשון: ███░", "סוואג: 0"] as const;
// UX-7 A/B variant B: ?ux_assemble=alt
const ASSEMBLE_LINES_ALT = ["שם: ░░░░", "תשוקה: ░░░", "גורל: ..."] as const;

export function EmailGate({
  onSubmit,
  error,
  assembling = false,
  assemblePhase = 0,
  assembleTicking = false,
  returning = false,
  defaultEmail = "",
}: Props) {
  const reduced = usePrefersReducedMotion();
  // UX-7 A/B: ?ux_assemble=alt swaps the assemble copy.
  const { assembleVariant } = getExperimentFlags();
  const ASSEMBLE_LINES = assembleVariant === "alt" ? ASSEMBLE_LINES_ALT : ASSEMBLE_LINES_DEFAULT;

  const [email, setEmail] = useState(defaultEmail);
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync defaultEmail when localStorage loads after hydration.
  useEffect(() => {
    if (defaultEmail && !email) {
      setEmail(defaultEmail);
    }
    // Only run when defaultEmail becomes available; don't overwrite user edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultEmail]);

  function triggerShake() {
    const el = formRef.current;
    if (!el) return;
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      el.classList.remove("is-shake");
    }
    void el.offsetWidth; // force reflow so animation replays
    el.classList.add("is-shake");
    shakeTimerRef.current = setTimeout(() => {
      el.classList.remove("is-shake");
      shakeTimerRef.current = null;
    }, 220);
  }

  // Shake on server error (error prop changes to non-empty).
  useEffect(() => {
    if (error) triggerShake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("אנא הזינ/י כתובת מייל תקינה");
      triggerShake();
      return;
    }

    if (!consent) {
      setLocalError("יש לאשר קבלת עדכונים כדי להמשיך");
      triggerShake();
      return;
    }

    await onSubmit(email);
  }

  return (
    <div className="game-email-screen">
      {!assembling && (
        <>
          {returning ? (
            <>
              <div className="game-email-headline">עוד סיבוב.</div>
              <div className="game-email-sub">אותו מייל. חיים חדשים.</div>
            </>
          ) : (
            <>
              <div className="game-email-headline">
                החיים שלך נוצרים.
                <br />
                צעד אחרון.
              </div>
              <div className="game-email-sub">
                נשמור את התוצאה שלך ונעדכן אותך בהמשכים ובהופעות
              </div>
            </>
          )}
        </>
      )}

      {assembling && (
        <div className="game-assemble-well" aria-live="polite" aria-atomic="false">
          {ASSEMBLE_LINES.map((line, i) => {
            const isVisible = assemblePhase >= i + 1;
            const isTicking = assembleTicking && i === 2 && isVisible;
            return (
              <div
                key={i}
                className={[
                  "game-assemble-line",
                  isVisible ? "is-visible" : "",
                  isTicking ? "is-ticking" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {line}
              </div>
            );
          })}
        </div>
      )}

      <form ref={formRef} className="game-email-form" onSubmit={handleSubmit} noValidate>
        {!assembling && (
          <>
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
                אני מסכימ/ה לקבל עדכונים ומידע על הופעות שאזאמאט. אפשר להסיר
                את עצמך בכל עת.
              </span>
            </label>

            {(localError || error) && (
              <div className="game-error-msg" role="alert">
                {localError || error}
              </div>
            )}
          </>
        )}

        <button
          className="game-btn game-btn-primary"
          type="submit"
          disabled={assembling}
        >
          {assembling ? "יוצרים את החיים…" : "התחל חיים"}
        </button>
      </form>
    </div>
  );
}
