"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { clearFeaturedShow } from "@/lib/shows/actions";
import { toast } from "sonner";
import { Pencil, X, Calendar, MapPin, Clock, Ticket } from "lucide-react";
import type { Show } from "@/generated/prisma/client";

function formatDate(date: Date): string {
  const d = new Date(date);
  return `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`;
}

export default function FeaturedCard({ featured }: { featured: Show | null }) {
  const [isPending, startTransition] = useTransition();
  const [show, setShow] = useState(featured);

  function handleClear() {
    startTransition(async () => {
      const result = await clearFeaturedShow();
      if (result.success) {
        setShow(null);
        toast.success("הופעה מודגשת נוקתה");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {/* Section label */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-orange-400 ring-2 ring-orange-400/30" />
          <h2 className="text-sm font-semibold text-zinc-100">הופעה מודגשת</h2>
          <span className="text-xs text-zinc-500">מוצגת בדף הבית</span>
        </div>
        {show && (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/shows/${show.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all duration-150"
            >
              <Pencil className="w-3 h-3" />
              עריכה
            </Link>
            <button
              onClick={handleClear}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-red-400 bg-zinc-800/50 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 rounded-lg transition-all duration-150 disabled:opacity-40"
            >
              <X className="w-3 h-3" />
              {isPending ? "מנקה..." : "הסר"}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {show ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Cover image */}
          {show.coverImage ? (
            <div className="relative flex-shrink-0 w-20 h-24 overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10">
              <Image
                src={show.coverImage}
                alt={`${show.venue}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-20 h-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{show.venue}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {show.city}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                {formatDate(show.date)}
              </span>
              {show.doorsTime && (
                <span className="flex items-center gap-1.5 text-sm text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  דלתות {show.doorsTime}
                </span>
              )}
              {show.ticketLink && (
                <a
                  href={show.ticketLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  כרטיסים
                </a>
              )}
            </div>
          </div>

          {/* Orange accent bar */}
          <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-s-xl" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
            <span className="text-xl">⭐</span>
          </div>
          <p className="text-sm font-medium text-zinc-300 mb-1">אין הופעה מודגשת</p>
          <p className="text-xs text-zinc-500 mb-4">
            הגדר הופעה כמודגשת כדי שתופיע בסקשן הראשי באתר
          </p>
          <Link
            href="/admin/shows/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
          >
            + הוסף הופעה מודגשת
          </Link>
        </div>
      )}
    </div>
  );
}
