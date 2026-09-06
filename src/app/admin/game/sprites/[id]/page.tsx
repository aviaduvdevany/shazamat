import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAsset } from "@/game/sprites/lab/inventory";
import { getVersionsAction } from "../actions";
import { readIndex } from "@/game/sprites/lab/store";
import { AssetStudio } from "./AssetStudio";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} | Sprite Lab`, robots: "noindex,nofollow" };
}

export default async function AssetPage({ params }: Props) {
  const { id } = await params;

  const ok = await isAuthenticated();
  if (!ok) redirect("/admin/login");

  const asset = getAsset(id);
  if (!asset) {
    return (
      <div className="text-center py-24 text-zinc-500">
        Asset <code className="text-orange-400">{id}</code> not found in inventory.
      </div>
    );
  }

  const versions = await getVersionsAction(id);
  const index = readIndex();
  const record = index[id];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <a href="/admin/game/sprites" className="hover:text-zinc-300 transition-colors">
          Sprite Lab
        </a>
        <span>→</span>
        <span className="text-zinc-300 font-mono">{id}</span>
      </div>

      <AssetStudio
        asset={{
          id: asset.id,
          family: asset.family,
          batch: asset.batch,
          diskStatus: asset.diskStatus,
          canvas: asset.canvas,
          model: asset.model,
          styleRef: asset.styleRef,
          promptSeed: asset.promptSeed,
          noBackground: asset.noBackground,
        }}
        versions={versions}
        approvedVersionId={record?.approvedVersionId}
        status={record?.status ?? "missing"}
      />
    </div>
  );
}
