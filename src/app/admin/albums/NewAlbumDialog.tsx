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
import AlbumForm from "./AlbumForm";
import { createAlbum } from "@/lib/albums/actions";

export default function NewAlbumDialog() {
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
          הוספת אלבום
        </button>
      </DialogTrigger>

      <DialogContent
        dir="rtl"
        className="!max-w-2xl w-full bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto p-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-xl font-black text-white text-right">
            הוספת אלבום חדש
          </DialogTitle>
          <p className="text-sm text-zinc-500 text-right mt-1">
            מלא את הפרטים לאלבום החדש
          </p>
        </DialogHeader>

        <div className="px-6 py-6">
          <AlbumForm onSubmit={createAlbum} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
