import React from "react";
import GalleryItem from "@/components/ui/GalleryItem";

export default function Gallery() {
  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="container-custom">
        <h2 className="text-[clamp(40px,5vw,64px)] font-bold mb-12 text-center text-white">
          רגעים מההופעות
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <GalleryItem key={item} index={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
