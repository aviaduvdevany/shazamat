"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { ShowSchema, type ShowFormData } from "@/lib/shows/schemas";
import { Upload, Star, Loader2, ImageIcon } from "lucide-react";

interface ShowFormProps {
  defaultValues?: Partial<ShowFormData>;
  showId?: string;
  onSubmit: (data: ShowFormData) => Promise<{ success: boolean; error?: string }>;
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

export default function ShowForm({ defaultValues, onSubmit, onSuccess, onCancel }: ShowFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(
    defaultValues?.coverImage ?? ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShowFormData>({
    resolver: zodResolver(ShowSchema),
    defaultValues: {
      date: defaultValues?.date ?? "",
      city: defaultValues?.city ?? "",
      venue: defaultValues?.venue ?? "",
      ticketLink: defaultValues?.ticketLink ?? "",
      doorsTime: defaultValues?.doorsTime ?? "",
      coverImage: defaultValues?.coverImage ?? "",
      isFeatured: defaultValues?.isFeatured ?? false,
    },
  });

  const isFeaturedValue = watch("isFeatured");

  const [uploadStats, setUploadStats] = useState<{
    originalKB: number;
    finalKB: number;
  } | null>(null);

  async function convertToWebP(
    file: File,
    maxPx = 1200,
    quality = 0.85
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // Scale down if larger than maxPx on either axis
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
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".webp"),
              { type: "image/webp" }
            );
            resolve(webpFile);
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
      toast.success(
        `התמונה הועלתה ✓  ${originalKB} KB → ${finalKB} KB (${Math.round((1 - finalKB / originalKB) * 100)}% קטן יותר)`
      );
    } catch {
      toast.error("שגיאה בהעלאת התמונה");
    } finally {
      setUploading(false);
    }
  }

  function submit(data: ShowFormData) {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        toast.success("ההופעה נשמרה בהצלחה");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/shows");
          router.refresh();
        }
      } else {
        toast.error(result.error ?? "שגיאה בשמירה");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8" dir="rtl">
      {/* Section: פרטי הופעה */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">פרטי ההופעה</h3>
          <p className="text-xs text-zinc-500 mt-0.5">מידע בסיסי שיוצג בטבלת ההופעות</p>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Date */}
          <div>
            <FieldLabel required>תאריך</FieldLabel>
            <input
              type="date"
              {...register("date")}
              className={inputClass}
            />
            {errors.date && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.date.message}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <FieldLabel required>עיר</FieldLabel>
            <input
              type="text"
              {...register("city")}
              placeholder="תל אביב"
              className={inputClass}
            />
            {errors.city && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.city.message}
              </p>
            )}
          </div>

          {/* Venue */}
          <div>
            <FieldLabel required>מקום</FieldLabel>
            <input
              type="text"
              {...register("venue")}
              placeholder="בארבי"
              className={inputClass}
            />
            {errors.venue && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.venue.message}
              </p>
            )}
          </div>

          {/* Ticket link */}
          <div>
            <FieldLabel hint="אופציונלי">קישור לכרטיסים</FieldLabel>
            <input
              type="url"
              {...register("ticketLink")}
              placeholder="https://barby.co.il/..."
              dir="ltr"
              className={inputClass + " text-right"}
            />
            {errors.ticketLink && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {errors.ticketLink.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section: הופעה מודגשת */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">הופעה מודגשת</h3>
          <p className="text-xs text-zinc-500 mt-0.5">שדות נוספים לתצוגה בסקשן הראשי באתר</p>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Featured toggle */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
            isFeaturedValue
              ? "border-orange-500/40 bg-orange-500/5"
              : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600"
          }`}>
            <div className="flex items-center pt-0.5">
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isFeaturedValue
                  ? "bg-orange-500 border-orange-500"
                  : "bg-zinc-800 border-zinc-600"
              }`}>
                {isFeaturedValue && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-100">הגדר כהופעה מודגשת</p>
                {isFeaturedValue && (
                  <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                הופעה מודגשת מוצגת עם תמונה גדולה וכפתור כרטיסים בדף הבית
              </p>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Doors time */}
            <div>
              <FieldLabel hint="לדוגמה: 20:30">שעת דלתות</FieldLabel>
              <input
                type="time"
                {...register("doorsTime")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <FieldLabel hint="מומלץ: 4:5 או ריבועי">תמונת קאבר</FieldLabel>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Preview */}
              <div className={`relative flex-shrink-0 w-24 h-28 rounded-xl overflow-hidden border transition-colors ${
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
                      onClick={() => {
                        setValue("coverImage", "");
                        setImagePreview("");
                      }}
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
                        <span className="text-xs text-emerald-500 font-medium">
                          ({Math.round((1 - uploadStats.finalKB / uploadStats.originalKB) * 100)}% קטן יותר)
                        </span>
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
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "שומר..." : "שמור הופעה"}
        </button>
        <button
          type="button"
          onClick={() => onCancel ? onCancel() : router.back()}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-center text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all duration-150"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
