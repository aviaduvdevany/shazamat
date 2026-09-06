import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInventoryAction } from "./actions";
import { InventoryGrid } from "./InventoryGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sprite Lab | Admin",
  robots: "noindex,nofollow",
};

// Force dynamic — reads from .sprites/index.json at request time
export const dynamic = "force-dynamic";

export default async function SpritesPage() {
  const ok = await isAuthenticated();
  if (!ok) redirect("/admin/login");

  const rows = await getInventoryAction();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sprite Lab</h1>
          <p className="text-zinc-400 text-sm mt-1">
            PixelLab generation pipeline — {rows.length} assets across Batch A/B/C
          </p>
        </div>
        <a
          href="/admin"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Admin
        </a>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />
          missing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500/70 inline-block" />
          drafted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          approved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          live
        </span>
      </div>

      <InventoryGrid rows={rows} />
    </div>
  );
}
