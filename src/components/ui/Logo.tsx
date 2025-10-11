import Image from "next/image";
import React from "react";

export default function Logo({
  width,
  height,
  variant,
}: {
  width: number;
  height: number;
  variant: "logo" | "icon";
}) {
  const variants = {
    logo: "/shazamat-assets/logo-official.png",
    icon: "/shazamat-assets/logo-shin.png",
  };
  return (
    <Image
      src={variants[variant]}
      alt="Shazamat"
      width={width}
      height={height}
    />
  );
}
