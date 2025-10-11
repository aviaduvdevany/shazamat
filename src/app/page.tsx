import React from "react";
import {
  Header,
  Footer,
  Hero,
  Shows,
  Music,
  Contact,
} from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Shows />
      <Music />
      <Contact />
      <Footer />
    </div>
  );
}
