import Image from "next/image";
import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image
        src="/shazamat-assets/logo-official.png"
        alt="Shazamat"
        width={100}
        height={100}
      />
    </div>
  );
}
