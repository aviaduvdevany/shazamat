import React from "react";
import { Header, Footer, Hero, Shows, Music, Contact } from "@/components";
import SkipLinks from "@/components/ui/SkipLinks";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SkipLinks />
      <Header />
      <main id="main-content">
        <Hero />
        <Shows />
        <Music />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
