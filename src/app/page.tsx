import React from "react";
import { Header, Footer, Hero, UpcomingShow, Shows, Music } from "@/components";
import SkipLinks from "@/components/ui/SkipLinks";
import StructuredData from "@/components/seo/StructuredData";

export default function Home() {
  return (
    <div className="min-h-screen">
      <StructuredData />
      <SkipLinks />
      <Header />
      <main id="main-content">
        <Hero />
        <UpcomingShow />
        <Shows />
        <Music />
        {/* <Contact /> */}
      </main>
      <Footer />
    </div>
  );
}
