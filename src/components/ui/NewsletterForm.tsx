"use client";

import React, { FormEvent, useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
    >
      <input
        type="email"
        placeholder="המייל שלך"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-6 py-4 border-2 border-black rounded-[var(--radius-md)] text-lg focus:outline-none focus:border-[var(--shazamat-orange)] transition-colors"
      />
      <button
        type="submit"
        className="bg-[var(--shazamat-orange)] text-black px-8 py-4 rounded-[var(--radius-md)] font-bold text-lg hover:bg-black hover:text-white transition-colors duration-[var(--duration-base)] whitespace-nowrap"
      >
        הרשמה
      </button>
    </form>
  );
}
