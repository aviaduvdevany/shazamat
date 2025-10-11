"use client";

import React, { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black text-white">
      <div className="container-custom">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a
            href="#home"
            className="text-2xl font-bold hover:text-[var(--shazamat-orange)] transition-colors"
          >
            שאזאמאט
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 text-base">
            <li>
              <a
                href="#home"
                className="hover:text-[var(--shazamat-orange)] transition-colors"
              >
                בית
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="hover:text-[var(--shazamat-orange)] transition-colors"
              >
                אודות
              </a>
            </li>
            <li>
              <a
                href="#shows"
                className="hover:text-[var(--shazamat-orange)] transition-colors"
              >
                הופעות
              </a>
            </li>
            <li>
              <a
                href="#music"
                className="hover:text-[var(--shazamat-orange)] transition-colors"
              >
                מוזיקה
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="hover:text-[var(--shazamat-orange)] transition-colors"
              >
                צור קשר
              </a>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            aria-label="תפריט"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <ul className="flex flex-col gap-4 text-base">
              <li>
                <a
                  href="#home"
                  className="block hover:text-[var(--shazamat-orange)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  בית
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="block hover:text-[var(--shazamat-orange)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  אודות
                </a>
              </li>
              <li>
                <a
                  href="#shows"
                  className="block hover:text-[var(--shazamat-orange)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  הופעות
                </a>
              </li>
              <li>
                <a
                  href="#music"
                  className="block hover:text-[var(--shazamat-orange)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  מוזיקה
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="block hover:text-[var(--shazamat-orange)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  צור קשר
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
