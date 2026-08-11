/**
 * Browser-only image optimization utility.
 * Uses the Canvas API to resize, convert to WebP, and generate a LQIP
 * (Low-Quality Image Placeholder) for blur placeholder support.
 *
 * Must only be imported inside "use client" components.
 */

export type OptimizeRole = "show-cover" | "album-cover";

const ROLE_CONFIG: Record<OptimizeRole, { maxPx: number; quality: number }> = {
  "show-cover":  { maxPx: 1600, quality: 0.82 },
  "album-cover": { maxPx: 1200, quality: 0.82 },
};

const LQIP_SIZE = 24; // LQIP canvas dimension in px
const LQIP_QUALITY = 0.5;

export type OptimizedImage = {
  /** WebP File ready to upload */
  file: File;
  width: number;
  height: number;
  /** Data URI for next/image `blurDataURL` */
  blurDataURL: string;
  originalKB: number;
  finalKB: number;
};

export async function optimizeCoverImage(
  file: File,
  role: OptimizeRole
): Promise<OptimizedImage> {
  const { maxPx, quality } = ROLE_CONFIG[role];

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // ── Resize ──────────────────────────────────────────────
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        const ratio = Math.min(maxPx / width, maxPx / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // ── Main canvas (full-res WebP) ──────────────────────────
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not available"));
      ctx.drawImage(img, 0, 0, width, height);

      // ── LQIP canvas (tiny blur placeholder) ──────────────────
      const lqipW = Math.round((LQIP_SIZE * width) / Math.max(width, height));
      const lqipH = Math.round((LQIP_SIZE * height) / Math.max(width, height));
      const lqipCanvas = document.createElement("canvas");
      lqipCanvas.width = lqipW;
      lqipCanvas.height = lqipH;
      const lqipCtx = lqipCanvas.getContext("2d");
      if (!lqipCtx) return reject(new Error("LQIP canvas not available"));
      lqipCtx.drawImage(img, 0, 0, lqipW, lqipH);
      const blurDataURL = lqipCanvas.toDataURL("image/jpeg", LQIP_QUALITY);

      // ── Export main WebP ─────────────────────────────────────
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("WebP conversion failed"));
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: "image/webp" }
          );
          resolve({
            file: webpFile,
            width,
            height,
            blurDataURL,
            originalKB: Math.round(file.size / 1024),
            finalKB: Math.round(blob.size / 1024),
          });
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}
