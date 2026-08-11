import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAlbumById } from "@/lib/albums/queries";
import { updateAlbum } from "@/lib/albums/actions";
import AlbumForm from "../../AlbumForm";
import type { Album } from "@/generated/prisma/client";
import type { AlbumFormData } from "@/lib/albums/schemas";

function albumToFormData(album: Album): Partial<AlbumFormData> {
  return {
    title: album.title,
    year: album.year,
    subtitle: album.subtitle ?? "",
    coverImage: album.coverImage ?? "",
    spotify: album.spotify ?? "",
    appleMusic: album.appleMusic ?? "",
    isHidden: album.isHidden,
  };
}

export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbumById(id);
  if (!album) notFound();

  return (
    <div className="max-w-2xl" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-8">
        <Link
          href="/admin/albums"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          אלבומים
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-zinc-700 rotate-180" />
        <span className="text-sm font-semibold text-zinc-100">עריכת אלבום</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">עריכת אלבום</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {album.title} · {album.year}
        </p>
      </div>

      <AlbumForm
        defaultValues={albumToFormData(album)}
        onSubmit={updateAlbum.bind(null, id)}
      />
    </div>
  );
}
