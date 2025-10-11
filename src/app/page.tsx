import React from "react";
import {
  Header,
  Footer,
  Hero,
  Shows,
  Music,
  EnergyBanner,
  Gallery,
  Contact,
} from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Shows />
      <Music />
      <EnergyBanner />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}
