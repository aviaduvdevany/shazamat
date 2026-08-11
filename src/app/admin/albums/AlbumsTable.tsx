"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { deleteAlbum, toggleAlbumVisibility } from "@/lib/albums/actions";
import { toast } from "sonner";
import { Pencil, Trash2, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { Album } from "@/generated/prisma/client";

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
              const result = await deleteAlbum(id);
              if (result.success) {
                toast.success("האלבום נמחק");
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
        <button onClick={() => setConfirm(false)} className="text-xs text-zinc-500 hover:text-zinc-300">
          לא
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title="מחק אלבום"
      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-150"
    >
      <Trash2 className="w-3.5 h-3.5" />
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
          const result = await toggleAlbumVisibility(id);
          if (result.success) {
            onToggle(!isHidden);
            toast.success(isHidden ? "האלבום מוצג שוב באתר" : "האלבום הוסתר מהאתר");
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

export default function AlbumsTable({ albums }: { albums: Album[] }) {
  const [items, setItems] = useState(albums);

  useEffect(() => {
    setItems(albums);
  }, [albums]);

  const visible = items.filter((a) => !a.isHidden);
  const hidden = items.filter((a) => a.isHidden);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-16 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">💿</span>
        </div>
        <p className="text-sm font-semibold text-zinc-300 mb-1">אין אלבומים עדיין</p>
        <p className="text-xs text-zinc-500 mb-5">הוסף את האלבום הראשון של שאזאמאט</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">{items.length}</span>
          <span className="text-xs text-zinc-500 leading-tight">סה״כ<br />אלבומים</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-emerald-400">{visible.length}</span>
          <span className="text-xs text-zinc-500 leading-tight">אלבומים<br />גלויים</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-500">{hidden.length}</span>
          <span className="text-xs text-zinc-500 leading-tight">אלבומים<br />מוסתרים</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900">
        {/* Desktop column header — hidden on mobile */}
        <div className="hidden md:grid grid-cols-[56px_1fr_80px_160px_100px] border-b border-zinc-800 bg-zinc-800/50 px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">עטיפה</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">שם האלבום</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">שנה</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">סטרימינג</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 text-center">פעולות</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/70">
          {items.map((album) => {
            const onDeleted = () => setItems((prev) => prev.filter((a) => a.id !== album.id));
            const onToggle = (next: boolean) =>
              setItems((prev) => prev.map((a) => (a.id === album.id ? { ...a, isHidden: next } : a)));

            return (
              <div
                key={album.id}
                className={`transition-colors group ${album.isHidden ? "bg-yellow-950/10" : ""}`}
              >
                {/* ── Mobile card (hidden md+) ── */}
                <div className={`md:hidden p-4 ${album.isHidden ? "hover:bg-yellow-950/20" : "hover:bg-zinc-800/30"}`}>
                  <div className="flex items-center gap-3">
                    {/* Cover */}
                    <div className="relative flex-shrink-0 w-11 h-11 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                      {album.coverImage ? (
                        <Image
                          src={album.coverImage}
                          alt={album.title}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-600 text-sm">💿</div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${album.isHidden ? "text-zinc-500" : "text-zinc-100"}`}>
                        {album.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5">
                        <span className={`text-xs ${album.isHidden ? "text-zinc-600" : "text-zinc-400"}`}>{album.year}</span>
                        {album.subtitle && <span className="text-xs text-zinc-600">{album.subtitle}</span>}
                        {album.spotify && (
                          <a href={album.spotify} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                            Spotify
                          </a>
                        )}
                        {album.appleMusic && (
                          <a href={album.appleMusic} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-pink-950/60 text-pink-400 border border-pink-800/50">
                            Apple
                          </a>
                        )}
                        {album.isHidden && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-950/60 text-yellow-500 border border-yellow-800/50">
                            <EyeOff className="w-2.5 h-2.5" />מוסתר
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Mobile action row */}
                  <div className="flex items-center justify-end gap-0.5 mt-3 pt-3 border-t border-zinc-800/60">
                    <Link
                      href={`/admin/albums/${album.id}/edit`}
                      title="ערוך"
                      className="p-2 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-md transition-all duration-150"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <VisibilityButton id={album.id} isHidden={album.isHidden} onToggle={onToggle} />
                    <DeleteButton id={album.id} onDeleted={onDeleted} />
                  </div>
                </div>

                {/* ── Desktop row (hidden < md) ── */}
                <div className={`hidden md:grid grid-cols-[56px_1fr_80px_160px_100px] items-center px-6 py-4 ${
                  album.isHidden ? "hover:bg-yellow-950/20" : "hover:bg-zinc-800/30"
                }`}>
                  {/* Cover */}
                  <div className="relative w-9 h-9 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                    {album.coverImage ? (
                    <Image
                          src={album.coverImage}
                          alt={album.title}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-zinc-600 text-[10px]">💿</div>
                    )}
                  </div>
                  {/* Title + subtitle */}
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${album.isHidden ? "text-zinc-500" : "text-zinc-100"}`}>
                      {album.title}
                    </p>
                    {album.subtitle && (
                      <p className="text-xs text-zinc-600 truncate">{album.subtitle}</p>
                    )}
                  </div>
                  {/* Year */}
                  <span className={`text-sm ${album.isHidden ? "text-zinc-600" : "text-zinc-400"}`}>{album.year}</span>
                  {/* Streaming badges */}
                  <div className="flex gap-1.5 flex-wrap items-center">
                    {album.spotify && (
                      <a href={album.spotify} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/60 transition-colors">
                        Spotify
                      </a>
                    )}
                    {album.appleMusic && (
                      <a href={album.appleMusic} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-pink-950/60 text-pink-400 border border-pink-800/50 hover:bg-pink-900/60 transition-colors">
                        Apple
                      </a>
                    )}
                    {album.isHidden && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-950/60 text-yellow-500 border border-yellow-800/50">
                        <EyeOff className="w-2.5 h-2.5" />מוסתר
                      </span>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-center gap-0.5">
                    <Link
                      href={`/admin/albums/${album.id}/edit`}
                      title="ערוך"
                      className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-md transition-all duration-150"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <VisibilityButton id={album.id} isHidden={album.isHidden} onToggle={onToggle} />
                    <DeleteButton id={album.id} onDeleted={onDeleted} />
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
