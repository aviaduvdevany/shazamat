import React from "react";
import { navItems } from "./nav";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Column 1 - About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">שאזאמאט</h3>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-lg">קישורים מהירים</h4>
            <ul className="space-y-2 text-gray-400">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-1 hover:text-[var(--shazamat-orange)] transition-colors"
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
                        width="12"
                        height="12"
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

          {/* Column 3 - Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg">צור קשר</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="mailto:mulu.records@gmail.com" className="hover:text-[var(--shazamat-orange)] transition-colors">
                  mulu.records@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2024 שאזאמאט. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
