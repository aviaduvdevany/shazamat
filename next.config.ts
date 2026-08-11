import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Match common device widths; avoids generating unnecessary variants
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // For fixed-size images (icons, admin thumbnails)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
    // Allow SVG through the image optimizer (social icons)
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
};

export default nextConfig;
