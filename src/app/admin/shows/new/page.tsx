import { createShow } from "@/lib/shows/actions";
import ShowForm from "../ShowForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewShowPage() {
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
        <span className="text-sm font-semibold text-zinc-100">הופעה חדשה</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">הוספת הופעה חדשה</h1>
        <p className="text-sm text-zinc-500 mt-1">מלא את הפרטים להופעה החדשה</p>
      </div>

      <ShowForm onSubmit={createShow} />
    </div>
  );
}
