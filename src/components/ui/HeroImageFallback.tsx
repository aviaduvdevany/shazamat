import React from "react";
import Image from "next/image";

export default function HeroImageFallback() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <Image
        src="/images/hero-image.webp"
        alt="Shazamat Background"
        fill
        priority
        className="object-cover"
        quality={90}
      />
    </div>
  );
}
