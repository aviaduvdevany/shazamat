"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { AlbumSchema, type AlbumFormData } from "@/lib/albums/schemas";
import { Upload, Loader2, ImageIcon } from "lucide-react";

interface AlbumFormProps {
  defaultValues?: Partial<AlbumFormData>;
  onSubmit: (data: AlbumFormData) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}


function FieldLabel({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-sm font-medium text-zinc-200">
        {children}
        {required && <span className="text-orange-400 mr-0.5">*</span>}
      </label>
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/70 transition-all duration-150 hover:border-zinc-600";

export default function AlbumForm({ defaultValues, onSubmit, onSuccess, onCancel }: AlbumFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(
    defaultValues?.coverImage ?? ""
  );
  const [uploadStats, setUploadStats] = useState<{
    originalKB: number;
    finalKB: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AlbumFormData>({
    resolver: zodResolver(AlbumSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      year: defaultValues?.year ?? (new Date().getFullYear() as number),
      subtitle: defaultValues?.subtitle ?? "",
      coverImage: defaultValues?.coverImage ?? "",
      spotify: defaultValues?.spotify ?? "",
      appleMusic: defaultValues?.appleMusic ?? "",
      isHidden: defaultValues?.isHidden ?? false,
    },
  });

  const isHiddenValue = watch("isHidden");

  async function convertToWebP(file: File, maxPx = 1200, quality = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          const ratio = Math.min(maxPx / width, maxPx / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not available"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("WebP conversion failed"));
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Failed to load image")); };
      img.src = objectUrl;
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStats(null);
    try {
      const originalKB = Math.round(file.size / 1024);
      const converted = await convertToWebP(file);
      const finalKB = Math.round(converted.size / 1024);
      setUploadStats({ originalKB, finalKB });
      const blob = await upload(converted.name, converted, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      setValue("coverImage", blob.url);
      setImagePreview(blob.url);
      toast.success(`התמונה הועלתה ✓  ${originalKB} KB → ${finalKB} KB`);
    } catch {
      toast.error("שגיאה בהעלאת התמונה");
    } finally {
      setUploading(false);
    }
  }

  function submit(data: AlbumFormData) {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        toast.success("האלבום נשמר בהצלחה");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/albums");
          router.refresh();
        }
      } else {
        toast.error(result.error ?? "שגיאה בשמירה");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8" dir="rtl">
      {/* Section: פרטי אלבום */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">פרטי האלבום</h3>
          <p className="text-xs text-zinc-500 mt-0.5">מידע בסיסי שיוצג בסקשן המוזיקה</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="md:col-span-2">
            <FieldLabel required>שם האלבום</FieldLabel>
            <input
              type="text"
              {...register("title")}
              placeholder="תופס אוויר"
              className={inputClass}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.title.message}
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <FieldLabel required>שנה</FieldLabel>
            <input
              type="number"
              {...register("year", { valueAsNumber: true })}
              placeholder="2024"
              min={1900}
              max={new Date().getFullYear() + 1}
              className={inputClass}
            />
            {errors.year && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.year.message}
              </p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <FieldLabel hint="אופציונלי">כותרת משנה</FieldLabel>
            <input
              type="text"
              {...register("subtitle")}
              placeholder="EP, סינגל..."
              className={inputClass}
            />
          </div>

          {/* Spotify */}
          <div>
            <FieldLabel hint="אופציונלי">קישור Spotify</FieldLabel>
            <input
              type="url"
              {...register("spotify")}
              placeholder="https://open.spotify.com/album/..."
              dir="ltr"
              className={inputClass + " text-right"}
            />
            {errors.spotify && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.spotify.message}
              </p>
            )}
          </div>

          {/* Apple Music */}
          <div>
            <FieldLabel hint="אופציונלי">קישור Apple Music</FieldLabel>
            <input
              type="url"
              {...register("appleMusic")}
              placeholder="https://music.apple.com/..."
              dir="ltr"
              className={inputClass + " text-right"}
            />
            {errors.appleMusic && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.appleMusic.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section: תמונה וגדרות */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">תמונה והגדרות</h3>
          <p className="text-xs text-zinc-500 mt-0.5">עטיפת האלבום וגדרות תצוגה</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Cover image */}
          <div>
            <FieldLabel hint="מומלץ: ריבועי">עטיפת האלבום</FieldLabel>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border transition-colors ${
                imagePreview ? "border-zinc-600" : "border-zinc-700 border-dashed"
              } bg-zinc-800`}>
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="תצוגה מקדימה"
                      fill
                      className="object-cover"
                      unoptimized={imagePreview.startsWith("/")}
                    />
                    <button
                      type="button"
                      onClick={() => { setValue("coverImage", ""); setImagePreview(""); }}
                      className="absolute top-1 left-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white text-[10px] hover:bg-black transition-colors"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="w-5 h-5 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Upload area */}
              <label className="flex-1 cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl px-4 py-5 text-center transition-all duration-150 ${
                  uploading
                    ? "border-orange-500/50 bg-orange-500/5"
                    : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50"
                }`}>
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                      <p className="text-xs text-zinc-400">ממיר ל-WebP ומעלה...</p>
                    </div>
                  ) : uploadStats ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-500 line-through">{uploadStats.originalKB} KB</span>
                        <span className="text-xs text-zinc-600">→</span>
                        <span className="text-xs font-semibold text-emerald-400">{uploadStats.finalKB} KB</span>
                      </div>
                      <p className="text-xs text-zinc-500">לחץ להחלפה</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-5 h-5 text-zinc-500" />
                      <div>
                        <p className="text-sm text-zinc-300 font-medium">לחץ להעלאת תמונה</p>
                        <p className="text-xs text-zinc-600 mt-0.5">PNG, JPG, WEBP · עד 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <input type="hidden" {...register("coverImage")} />
          </div>

          {/* Hidden toggle */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
            isHiddenValue
              ? "border-yellow-600/40 bg-yellow-500/5"
              : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600"
          }`}>
            <div className="flex items-center pt-0.5">
              <input type="checkbox" {...register("isHidden")} className="sr-only" />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isHiddenValue ? "bg-yellow-500 border-yellow-500" : "bg-zinc-800 border-zinc-600"
              }`}>
                {isHiddenValue && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">הסתר מהאתר</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                האלבום לא יוצג בסקשן המוזיקה הציבורי
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "שומר..." : "שמור אלבום"}
        </button>
        <button
          type="button"
          onClick={() => onCancel ? onCancel() : router.back()}
          className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all duration-150"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
