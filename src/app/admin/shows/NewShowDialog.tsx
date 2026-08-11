"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ShowForm from "./ShowForm";
import { createShow } from "@/lib/shows/actions";

export default function NewShowDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-150">
          <Plus className="w-4 h-4" />
          הוספת הופעה
        </button>
      </DialogTrigger>

      <DialogContent
        dir="rtl"
        className="!max-w-2xl w-full bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto p-0"
      >
        <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-xl font-black text-white text-right">
            הוספת הופעה חדשה
          </DialogTitle>
          <p className="text-sm text-zinc-500 text-right mt-1">
            מלא את הפרטים להופעה החדשה
          </p>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-5 sm:py-6">
          <ShowForm onSubmit={createShow} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
