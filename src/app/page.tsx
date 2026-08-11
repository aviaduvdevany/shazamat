import React from "react";
import { Header, Footer, Hero, UpcomingShow, Shows, Music } from "@/components";
import SkipLinks from "@/components/ui/SkipLinks";
import StructuredData from "@/components/seo/StructuredData";
import { getPublicShows, getPublicFeaturedShow } from "@/lib/shows/queries";
import { getPublicAlbums } from "@/lib/albums/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [shows, featured, albums] = await Promise.all([
    getPublicShows(),
    getPublicFeaturedShow(),
    getPublicAlbums(),
  ]);

  const futureShows = shows.filter((s) => !s.isPast);

  return (
    <div className="min-h-screen">
      <StructuredData shows={futureShows} albums={albums} />
      <SkipLinks />
      <Header />
      <main id="main-content">
        <Hero />
        <UpcomingShow featured={featured} />
        <Shows shows={shows} />
        <Music albums={albums} />
        {/* <Contact /> */}
      </main>
      <Footer />
    </div>
  );
}
