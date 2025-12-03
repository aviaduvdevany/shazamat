"use client";

import React, { useState, useEffect, useRef } from "react";
import Logo from "../ui/Logo";

const navItems = [
  {
    label: "בית",
    href: "#home",
  },
  {
    label: "הופעות",
    href: "#shows",
  },
  {
    label: "מוזיקה",
    href: "#music",
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 bg-black text-white">
      <div className="container-custom">
        <div className="flex items-center justify-between h-[80px]">
          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 text-lg">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="hover:text-[var(--shazamat-orange)] transition-colors text-[30px]"
                >
                  {item.label}
                </a>
              </li>
            ))}
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
          {/* Logo */}
          <a
            href="#home"
            className="text-2xl font-bold hover:text-[var(--shazamat-orange)] transition-colors"
          >
            <Logo width={50} height={50} variant="icon" />
          </a>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <ul className="flex flex-col gap-4 text-base">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-[var(--shazamat-orange)] transition-colors text-[20px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
