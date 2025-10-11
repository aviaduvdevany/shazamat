import React from "react";

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-white">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-[clamp(40px,5vw,64px)] font-bold mb-6">
                מי אנחנו
              </h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  שאזאמאט היא לא סתם להקה - אנחנו תנועה. אנחנו מביאים את האנרגיה
                  הגולמית של תרבות האולטראס, את הרגש של האצטדיון, ואת הנאמנות של
                  הקהל הכי מסור שיש.
                </p>
                <p>
                  המוזיקה שלנו היא שילוב של כוח, אותנטיות והומור עצמי. אנחנו לא
                  מפחדים להיות אמיתיים, לא מפחדים להיות רועשים, ובטח לא מפחדים
                  להיות שונים.
                </p>
                <p>
                  כל הופעה שלנו היא חוויה. כל שיר הוא קריאה להתעורר. כל רגע על
                  הבמה הוא רגע של חיבור אמיתי עם הקהל.
                </p>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="aspect-square bg-black rounded-[var(--radius-lg)] overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-6xl font-bold opacity-20">
                    שאזאמאט
                  </div>
                </div>
                {/* Placeholder gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-800"></div>
              </div>
              {/* Orange accent element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--shazamat-orange)] rounded-[var(--radius-lg)] -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
