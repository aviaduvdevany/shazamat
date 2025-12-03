"use client";

import React, { FormEvent, useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("אנא הזן כתובת מייל תקינה");
      return;
    }

    try {
      // TODO: Implement newsletter subscription
      console.log("Newsletter subscription:", email);
      setStatus("success");
      setEmail("");
      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setErrorMessage("אירעה שגיאה. אנא נסה שוב מאוחר יותר.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
      noValidate
      aria-labelledby="newsletter-heading"
    >
      <div className="flex-1 flex flex-col">
        <label htmlFor="newsletter-email" className="sr-only">
          כתובת מייל להרשמה לניוזלטר
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="המייל שלך"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          required
          aria-required="true"
          aria-invalid={status === "error"}
          aria-describedby={
            status === "error"
              ? "newsletter-error"
              : status === "success"
              ? "newsletter-success"
              : undefined
          }
          className="flex-1 px-6 py-4 border-2 border-black rounded-[var(--radius-md)] text-lg focus:outline-none focus:border-[var(--shazamat-orange)] transition-colors"
        />
      </div>
      <button
        type="submit"
        className="bg-[var(--shazamat-orange)] text-black px-8 py-4 rounded-[var(--radius-md)] font-bold text-lg hover:bg-black hover:text-white transition-colors duration-[var(--duration-base)] whitespace-nowrap"
        aria-label="הרשמה לניוזלטר"
      >
        הרשמה
      </button>

      {/* Screen reader announcements */}
      <div
        id="newsletter-success"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status === "success" && "נרשמת בהצלחה לניוזלטר!"}
      </div>
      <div
        id="newsletter-error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={status === "error" ? "text-red-600 mt-2 text-sm" : "sr-only"}
      >
        {errorMessage}
      </div>
    </form>
  );
}
