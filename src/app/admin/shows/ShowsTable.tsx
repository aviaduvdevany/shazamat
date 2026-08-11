"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { deleteShow, setFeaturedShow, toggleShowVisibility } from "@/lib/shows/actions";
import { toast } from "sonner";
import { Pencil, Trash2, Star, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { ShowWithStatus } from "@/lib/shows/queries";

const HEBREW_MONTHS: Record<number, string> = {
  0: "ינו׳", 1: "פבר׳", 2: "מרץ", 3: "אפר׳", 4: "מאי", 5: "יוני",
  6: "יולי", 7: "אוג׳", 8: "ספט׳", 9: "אוק׳", 10: "נוב׳", 11: "דצ׳",
};

function formatDate(date: Date): { day: string; month: string; year: string } {
  const d = new Date(date);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: HEBREW_MONTHS[d.getMonth()],
    year: String(d.getFullYear()),
  };
}

// ── Delete ──────────────────────────────────────────────────

function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-800/50 rounded-lg px-2 py-1">
        <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
        <span className="text-xs text-red-300">בטוח?</span>
        <button
          onClick={() =>
            startTransition(async () => {
              const result = await deleteShow(id);
              if (result.success) {
                toast.success("ההופעה נמחקה");
                onDeleted();
              } else {
                toast.error(result.error);
                setConfirm(false);
              }
            })
          }
          disabled={isPending}
          className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {isPending ? "..." : "כן"}
        </button>
        <span className="text-zinc-700">·</span>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          לא
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title="מחק הופעה"
      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-150"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

// ── Set featured ─────────────────────────────────────────────

function SetFeaturedButton({ id, isFeatured }: { id: string; isFeatured: boolean }) {
  const [isPending, startTransition] = useTransition();
  if (isFeatured) return null;

  return (
    <button
      title="הגדר כמודגשת"
      onClick={() =>
        startTransition(async () => {
          const result = await setFeaturedShow(id);
          if (result.success) toast.success("ההופעה הוגדרה כמודגשת");
          else toast.error(result.error);
        })
      }
      disabled={isPending}
      className="p-1.5 text-zinc-600 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-150 disabled:opacity-50"
    >
      <Star className="w-3.5 h-3.5" />
    </button>
  );
}

// ── Toggle visibility ────────────────────────────────────────

function VisibilityButton({
  id,
  isHidden,
  onToggle,
}: {
  id: string;
  isHidden: boolean;
  onToggle: (next: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      title={isHidden ? "הצג באתר" : "הסתר מהאתר"}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleShowVisibility(id);
          if (result.success) {
            onToggle(!isHidden);
            toast.success(isHidden ? "ההופעה מוצגת שוב באתר" : "ההופעה הוסתרה מהאתר");
          } else {
            toast.error(result.error);
          }
        })
      }
      disabled={isPending}
      className={`p-1.5 rounded-md transition-all duration-150 disabled:opacity-50 ${
        isHidden
          ? "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
          : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/50"
      }`}
    >
      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Main table ───────────────────────────────────────────────

export default function ShowsTable({ shows }: { shows: ShowWithStatus[] }) {
  const [items, setItems] = useState(shows);

  useEffect(() => {
    setItems(shows);
  }, [shows]);

  const upcoming = items.filter((s) => !s.isPast && !s.isHidden);
  const hidden = items.filter((s) => s.isHidden);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-16 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">🎤</span>
        </div>
        <p className="text-sm font-semibold text-zinc-300 mb-1">אין הופעות עדיין</p>
        <p className="text-xs text-zinc-500 mb-5">הוסף את ההופעה הראשונה של שאזאמאט</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">{items.length}</span>
          <span className="text-xs text-zinc-500 leading-tight">סה״כ<br />הופעות</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-emerald-400">{upcoming.length}</span>
          <span className="text-xs text-zinc-500 leading-tight">הופעות<br />עתידיות</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-500">{hidden.length}</span>
          <span className="text-xs text-zinc-500 leading-tight">הופעות<br />מוסתרות</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900">
        {/* Desktop column header — hidden on mobile */}
        <div className="hidden md:grid grid-cols-[140px_1fr_1fr_160px_120px] border-b border-zinc-800 bg-zinc-800/50 px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">תאריך</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">מקום</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">עיר</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">סטטוס</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 text-center">פעולות</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/70">
          {items.map((show) => {
            const { day, month, year } = formatDate(show.date);
            const onDeleted = () => setItems((prev) => prev.filter((s) => s.id !== show.id));
            const onToggle = (next: boolean) =>
              setItems((prev) => prev.map((s) => (s.id === show.id ? { ...s, isHidden: next } : s)));

            return (
              <div
                key={show.id}
                className={`transition-colors group ${
                  show.isHidden ? "bg-yellow-950/10" : ""
                } ${show.isPast && !show.isHidden ? "opacity-55" : ""}`}
              >
                {/* ── Mobile card (hidden md+) ── */}
                <div className={`md:hidden p-4 ${show.isHidden ? "hover:bg-yellow-950/20" : "hover:bg-zinc-800/30"}`}>
                  <div className="flex items-start gap-3">
                    {/* Date tile */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex flex-col items-center justify-center ${
                      show.isHidden ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-800 border-zinc-700"
                    }`}>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase leading-none">{month}</span>
                      <span className={`text-base font-black leading-tight ${show.isHidden ? "text-zinc-500" : "text-white"}`}>{day}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {show.isFeatured && <Star className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 fill-orange-400" />}
                        <span className={`text-sm font-semibold truncate ${show.isHidden ? "text-zinc-500" : "text-zinc-100"}`}>{show.venue}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                        <span className={`text-xs ${show.isHidden ? "text-zinc-600" : "text-zinc-400"}`}>{show.city}</span>
                        <span className="text-zinc-700 text-xs">·</span>
                        <span className="text-xs text-zinc-600">{year}</span>
                        {show.isHidden && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-950/60 text-yellow-500 border border-yellow-800/50">
                            <EyeOff className="w-2.5 h-2.5" />מוסתר
                          </span>
                        )}
                        {!show.isHidden && (
                          show.isPast ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">עברה</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">עתידית</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Mobile action row */}
                  <div className="flex items-center justify-end gap-0.5 mt-3 pt-3 border-t border-zinc-800/60">
                    <Link
                      href={`/admin/shows/${show.id}/edit`}
                      title="ערוך"
                      className="p-2 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-md transition-all duration-150"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <SetFeaturedButton id={show.id} isFeatured={show.isFeatured} />
                    <VisibilityButton id={show.id} isHidden={show.isHidden} onToggle={onToggle} />
                    <DeleteButton id={show.id} onDeleted={onDeleted} />
                  </div>
                </div>

                {/* ── Desktop row (hidden < md) ── */}
                <div className={`hidden md:grid grid-cols-[140px_1fr_1fr_160px_120px] items-center px-6 py-4 ${
                  show.isHidden ? "hover:bg-yellow-950/20" : "hover:bg-zinc-800/30"
                }`}>
                  {/* Date tile */}
                  <div className="flex items-center gap-2.5">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex flex-col items-center justify-center transition-colors group-hover:border-zinc-600 ${
                      show.isHidden ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-800 border-zinc-700"
                    }`}>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase leading-none">{month}</span>
                      <span className={`text-base font-black leading-tight ${show.isHidden ? "text-zinc-500" : "text-white"}`}>{day}</span>
                    </div>
                    <span className="text-xs text-zinc-600">{year}</span>
                  </div>
                  {/* Venue */}
                  <div className="flex items-center gap-2 min-w-0">
                    {show.isFeatured && <Star className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 fill-orange-400" />}
                    <span className={`text-sm font-semibold truncate ${show.isHidden ? "text-zinc-500" : "text-zinc-100"}`}>{show.venue}</span>
                  </div>
                  {/* City */}
                  <span className={`text-sm ${show.isHidden ? "text-zinc-600" : "text-zinc-400"}`}>{show.city}</span>
                  {/* Status badges */}
                  <div className="flex gap-1.5 flex-wrap items-center">
                    {show.isHidden && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-950/60 text-yellow-500 border border-yellow-800/50">
                        <EyeOff className="w-2.5 h-2.5" />מוסתר
                      </span>
                    )}
                    {!show.isHidden && (
                      show.isPast ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">עברה</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">עתידית</span>
                      )
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-center gap-0.5">
                    <Link
                      href={`/admin/shows/${show.id}/edit`}
                      title="ערוך"
                      className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-md transition-all duration-150"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <SetFeaturedButton id={show.id} isFeatured={show.isFeatured} />
                    <VisibilityButton id={show.id} isHidden={show.isHidden} onToggle={onToggle} />
                    <DeleteButton id={show.id} onDeleted={onDeleted} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
