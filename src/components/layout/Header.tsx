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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);

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

  // Keyboard handlers: Escape key and focus trap
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    // Focus trap: keep focus within menu when open
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const menuItems =
        menuRef.current?.querySelectorAll<HTMLAnchorElement>(
          'a[role="menuitem"]'
        );
      if (!menuItems || menuItems.length === 0) return;

      const firstItem = menuItems[0];
      const lastItem = menuItems[menuItems.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: if focus is on first item, move to menu button
        if (document.activeElement === firstItem) {
          event.preventDefault();
          menuButtonRef.current?.focus();
        }
      } else {
        // Tab: if focus is on last item, move to menu button
        if (document.activeElement === lastItem) {
          event.preventDefault();
          menuButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);

    // Focus first menu item when menu opens
    setTimeout(() => {
      firstMenuItemRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
    };
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
            ref={menuButtonRef}
            className="md:hidden text-white"
            aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="true"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
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
          <div
            ref={menuRef}
            id="mobile-menu"
            className="md:hidden pb-4"
            role="menu"
            aria-label="תפריט ניווט ראשי"
          >
            <ul className="flex flex-col gap-4 text-base">
              {navItems.map((item, index) => (
                <li key={item.label}>
                  <a
                    ref={index === 0 ? firstMenuItemRef : null}
                    href={item.href}
                    className="hover:text-[var(--shazamat-orange)] transition-colors text-[20px]"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
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
