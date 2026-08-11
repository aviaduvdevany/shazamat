import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getShowById } from "@/lib/shows/queries";
import { updateShow } from "@/lib/shows/actions";
import ShowForm from "../../ShowForm";
import type { Show } from "@/generated/prisma/client";
import type { ShowFormData } from "@/lib/shows/schemas";

function toInputDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function showToFormData(show: Show): Partial<ShowFormData> {
  return {
    date: toInputDate(show.date),
    city: show.city,
    venue: show.venue,
    ticketLink: show.ticketLink ?? "",
    doorsTime: show.doorsTime ?? "",
    coverImage: show.coverImage ?? "",
    isFeatured: show.isFeatured,
  };
}

export default async function EditShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const show = await getShowById(id);
  if (!show) notFound();

  return (
    <div className="max-w-2xl" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-8">
        <Link
          href="/admin/shows"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          הופעות
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-zinc-700 rotate-180" />
        <span className="text-sm font-semibold text-zinc-100">עריכת הופעה</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">עריכת הופעה</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {show.venue} · {show.city}
        </p>
      </div>

      <ShowForm
        defaultValues={showToFormData(show)}
        showId={id}
        onSubmit={updateShow.bind(null, id)}
      />
    </div>
  );
}
