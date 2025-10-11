import React from "react";

export default function EnergyBanner() {
  return (
    <section className="py-20 bg-[var(--shazamat-orange)] text-black overflow-hidden">
      <div className="container-custom">
        <div className="text-center">
          <p className="text-[clamp(24px,4vw,48px)] font-bold leading-tight">
            כל הופעה היא חוויה. כל שיר הוא קריאה. כל רגע הוא חיבור.
          </p>
        </div>
      </div>
    </section>
  );
}
