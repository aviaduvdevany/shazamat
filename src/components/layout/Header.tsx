import React from "react";
import Logo from "../ui/Logo";
import MobileNav from "./MobileNav";
import { navItems } from "./nav";

/**
 * Header — RSC shell.
 * Desktop nav items + logo are server-rendered static HTML.
 * Only the hamburger state + mobile panel lives in the MobileNav client island.
 */
export default function Header() {
  return (
    <MobileNav
      navSlot={
        <ul className="hidden md:flex items-center gap-8 text-lg">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="inline-flex items-center gap-1 hover:text-[var(--shazamat-orange)] transition-colors text-[30px]"
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
                    width="16"
                    height="16"
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
      }
      logoSlot={
        <a
          href="#home"
          className="text-2xl font-bold hover:text-[var(--shazamat-orange)] transition-colors"
        >
          <Logo width={50} height={50} variant="icon" />
        </a>
      }
    />
  );
}
