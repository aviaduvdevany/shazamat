import React from "react";
import Logo from "../ui/Logo";
import MobileNav from "./MobileNav";

const navItems = [
  { label: "בית", href: "#home" },
  { label: "הופעות", href: "#shows" },
  { label: "מוזיקה", href: "#music" },
];

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
                className="hover:text-[var(--shazamat-orange)] transition-colors text-[30px]"
              >
                {item.label}
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
