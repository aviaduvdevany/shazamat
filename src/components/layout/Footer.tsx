import React from "react";

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
