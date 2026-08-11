"use client";

import React, { useState, useEffect, useRef } from "react";
import { navItems } from "./nav";

interface MobileNavProps {
  /** Desktop nav list — rendered on the server */
  navSlot: React.ReactNode;
  /** Logo link — rendered on the server */
  logoSlot: React.ReactNode;
}

export default function MobileNav({ navSlot, logoSlot }: MobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const menuItems = menuRef.current?.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]');
      if (!menuItems || menuItems.length === 0) return;
      const firstItem = menuItems[0];
      const lastItem = menuItems[menuItems.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === firstItem) {
          event.preventDefault();
          menuButtonRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastItem) {
          event.preventDefault();
          menuButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);
    setTimeout(() => firstMenuItemRef.current?.focus(), 100);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
    };
  }, [mobileMenuOpen]);

  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 bg-black text-white">
      <div className="container-custom">
        {/* Mirrors the original: [desktop-nav] [mobile-button] [logo] */}
        <div className="flex items-center justify-between h-[80px]">
          {navSlot}

          {/* Hamburger — client only, hidden on desktop */}
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

          {logoSlot}
        </div>

        {/* Mobile menu panel */}
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
                    className="inline-flex items-center gap-1 hover:text-[var(--shazamat-orange)] transition-colors text-[20px]"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                    {...(item.external
                      ? {
                          target: "_blank",
                          rel: "noopener noreferrer",
                          "aria-label": `${item.label} (נפתח בחלון חדש)`,
                        }
                      : {})}
                  >
                    {item.label}
                    {item.external && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="shrink-0 opacity-60"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    )}
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
