import React from "react";
import NewsletterForm from "@/components/ui/NewsletterForm";
import SocialLinks from "@/components/ui/SocialLinks";

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[clamp(40px,5vw,64px)] font-bold mb-6">
            הצטרף למשפחה
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            קבל עדכונים על הופעות חדשות, שירים חדשים, ותוכן בלעדי ישירות למייל
          </p>

          {/* Newsletter Form */}
          <NewsletterForm />

          {/* Social Links */}
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
