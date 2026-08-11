import React, { Suspense } from "react";
import { Header, Footer, Hero, UpcomingShow, Shows, Music } from "@/components";
import SkipLinks from "@/components/ui/SkipLinks";
import StructuredData from "@/components/seo/StructuredData";

// ISR: serve cached HTML from CDN; revalidate after 60 s in the background
export const revalidate = 60;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Async RSC — fetches shows + albums from Data Cache for structured data */}
      <Suspense fallback={null}>
        <StructuredData />
      </Suspense>
      <SkipLinks />
      <Header />
      <main id="main-content">
        {/* Hero has no DB dependency — streams immediately */}
        <Hero />
        {/* Each section is an async RSC that reads from the same Data Cache */}
        <Suspense fallback={<section className="py-20 md:py-32 bg-black" />}>
          <UpcomingShow />
        </Suspense>
        <Suspense fallback={<section className="py-24 md:py-32 bg-white" />}>
          <Shows />
        </Suspense>
        <Suspense fallback={<section className="py-24 md:py-32 bg-black" />}>
          <Music />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
