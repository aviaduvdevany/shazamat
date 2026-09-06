"use client";

import { useState, useTransition } from "react";
import { generateAction, approveAction, promoteAction } from "../actions";
import type { VersionData } from "../actions";
import type { AssetFamily, AssetBatch } from "@/game/sprites/lab/inventory";
import type { AssetLabStatus } from "@/game/sprites/lab/store";
import { CompositorPreview } from "./CompositorPreview";

interface AssetInfo {
  id: string;
  family: AssetFamily;
  batch: AssetBatch;
  diskStatus: "REPLACE" | "NEW";
  canvas: [number, number];
  model: string;
  styleRef?: string;
  promptSeed: string;
  noBackground: boolean;
}

interface Props {
  asset: AssetInfo;
  versions: VersionData[];
  approvedVersionId?: string;
  status: AssetLabStatus;
}

const STATUS_BADGE: Record<AssetLabStatus, string> = {
  missing: "bg-zinc-700 text-zinc-300",
  drafted: "bg-yellow-900/60 text-yellow-300 border border-yellow-600/30",
  approved: "bg-blue-900/60 text-blue-300 border border-blue-500/30",
  live: "bg-green-900/60 text-green-300 border border-green-500/30",
};

export function AssetStudio({ asset, versions: initVersions, approvedVersionId: initApproved, status: initStatus }: Props) {
  const [versions, setVersions] = useState<VersionData[]>(initVersions);
  const [approvedVersionId, setApprovedVersionId] = useState(initApproved);
  const [status, setStatus] = useState(initStatus);
  const [selectedVer, setSelectedVer] = useState<string | null>(initApproved ?? initVersions[initVersions.length - 1]?.versionId ?? null);
  const [n, setN] = useState(4);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [promoteResult, setPromoteResult] = useState<string | null>(null);

  const selectedVersion = versions.find((v) => v.versionId === selectedVer);

  function showMsg(type: "ok" | "err", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  function handleGenerate() {
    startTransition(async () => {
      setMessage(null);
      const results = await generateAction(asset.id, n);
      const newVersions: VersionData[] = [];
      for (const r of results) {
        if (r.ok && r.versionId) {
          newVersions.push({
            versionId: r.versionId,
            model: asset.model,
            prompt: asset.promptSeed,
            qaIssues: r.qaIssues ?? [],
            costUsd: r.costUsd,
            createdAt: new Date().toISOString(),
            processedPngUrl: `/api/sprites/image?id=${encodeURIComponent(asset.id)}&ver=${encodeURIComponent(r.versionId)}&type=processed`,
            rawPngUrl: `/api/sprites/image?id=${encodeURIComponent(asset.id)}&ver=${encodeURIComponent(r.versionId)}&type=raw`,
          });
        } else if (!r.ok) {
          showMsg("err", r.error ?? "Generation failed");
        }
      }
      if (newVersions.length) {
        setVersions((prev) => [...prev, ...newVersions]);
        setSelectedVer(newVersions[newVersions.length - 1].versionId);
        setStatus("drafted");
        showMsg("ok", `Generated ${newVersions.length} variant(s)`);
      }
    });
  }

  function handleApprove() {
    if (!selectedVer) return;
    startTransition(async () => {
      const res = await approveAction(asset.id, selectedVer);
      if (res.ok) {
        setApprovedVersionId(selectedVer);
        setStatus("approved");
        showMsg("ok", `Approved version ${selectedVer}`);
      } else {
        showMsg("err", res.error ?? "Approve failed");
      }
    });
  }

  function handlePromote() {
    startTransition(async () => {
      const res = await promoteAction(asset.id);
      if (res.ok) {
        setStatus("live");
        setPromoteResult(
          `✓ Promoted (${res.action}${res.catalogUpdated ? ", catalog updated" : ""}). Run npm run game:validate.`
        );
        showMsg("ok", "Promoted successfully");
      } else {
        showMsg("err", res.error ?? "Promote failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Asset header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white font-mono">{asset.id}</h2>
            <p className="text-zinc-500 text-sm mt-1">
              {asset.canvas[0]}×{asset.canvas[1]}px · {asset.family} · Batch {asset.batch} · {asset.diskStatus}
            </p>
            {asset.styleRef && (
              <p className="text-zinc-600 text-xs mt-0.5">
                style lock → <a href={`/admin/game/sprites/${asset.styleRef}`} className="text-orange-400 hover:underline">{asset.styleRef}</a>
              </p>
            )}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[status]}`}>
            {status}
          </span>
        </div>

        <div className="bg-zinc-950 rounded-lg p-3 text-xs text-zinc-400 font-mono leading-relaxed break-words">
          {asset.promptSeed}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Generate */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">Variants:</label>
          <select
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            disabled={isPending}
            className="px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none"
          >
            {[1, 2, 3, 4, 6, 8].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded transition-colors"
          >
            {isPending ? "Generating…" : "Generate"}
          </button>
        </div>

        {/* Approve */}
        <button
          onClick={handleApprove}
          disabled={isPending || !selectedVer || selectedVer === approvedVersionId}
          className="px-3 py-1.5 text-xs font-medium border border-blue-500/50 text-blue-300 hover:bg-blue-900/30 disabled:opacity-30 rounded transition-colors"
        >
          Approve selected
        </button>

        {/* Promote */}
        <button
          onClick={handlePromote}
          disabled={isPending || !approvedVersionId || status === "live"}
          className="px-3 py-1.5 text-xs font-medium border border-green-500/50 text-green-300 hover:bg-green-900/30 disabled:opacity-30 rounded transition-colors"
        >
          Promote to game
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div className={`px-4 py-2.5 rounded-lg text-sm ${message.type === "ok" ? "bg-green-900/40 text-green-300 border border-green-600/30" : "bg-red-900/40 text-red-300 border border-red-600/30"}`}>
          {message.text}
        </div>
      )}
      {promoteResult && (
        <div className="px-4 py-2.5 rounded-lg text-sm bg-green-900/20 text-green-400 border border-green-600/20 font-mono">
          {promoteResult}
        </div>
      )}

      {/* Main content — version strip + preview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Version strip */}
        <div className="xl:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Versions ({versions.length})
          </h3>

          {versions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-600">
              No versions yet — click Generate to create some.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {versions.map((v) => (
                <VersionCard
                  key={v.versionId}
                  version={v}
                  isSelected={selectedVer === v.versionId}
                  isApproved={approvedVersionId === v.versionId}
                  onClick={() => setSelectedVer(v.versionId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="space-y-4">
          {/* Selected version at 4× */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              4× Preview
            </h3>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
              {selectedVersion ? (
                <img
                  src={selectedVersion.processedPngUrl}
                  alt={asset.id}
                  width={asset.canvas[0] * 4}
                  height={asset.canvas[1] * 4}
                  style={{ imageRendering: "pixelated" }}
                  className="max-w-full"
                />
              ) : (
                <span className="text-zinc-700 text-sm">Select a version</span>
              )}
            </div>
            {selectedVersion?.qaIssues && selectedVersion.qaIssues.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/20 rounded-lg p-2.5">
                <p className="text-xs text-yellow-400 font-semibold mb-1">QA Issues</p>
                {selectedVersion.qaIssues.map((issue, i) => (
                  <p key={i} className="text-xs text-yellow-300/80">{issue}</p>
                ))}
              </div>
            )}
          </div>

          {/* Compositor playground */}
          {asset.family === "look" && selectedVersion && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                In scene
              </h3>
              <CompositorPreview processedPngUrl={selectedVersion.processedPngUrl} />
            </div>
          )}

          {/* Scene dimmed preview */}
          {asset.family === "scene" && selectedVersion && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Scene at 60% opacity
              </h3>
              <div
                className="rounded-xl overflow-hidden border border-zinc-800"
                style={{ background: "#0a0a0a", width: 320, height: 288 }}
              >
                <img
                  src={selectedVersion.processedPngUrl}
                  alt={asset.id}
                  width={320}
                  height={288}
                  style={{ imageRendering: "pixelated", opacity: 0.6, display: "block" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VersionCard({
  version,
  isSelected,
  isApproved,
  onClick,
}: {
  version: VersionData;
  isSelected: boolean;
  isApproved: boolean;
  onClick: () => void;
}) {
  const hasQA = version.qaIssues.length > 0;

  return (
    <button
      onClick={onClick}
      className={`relative group rounded-lg border-2 overflow-hidden transition-all text-left ${
        isSelected
          ? "border-orange-500"
          : isApproved
          ? "border-blue-500"
          : "border-zinc-800 hover:border-zinc-600"
      }`}
    >
      {/* Image */}
      <div
        className="flex items-center justify-center p-2"
        style={{ background: isApproved ? "#0d1c2e" : "#0a0a0a", minHeight: 80 }}
      >
        <img
          src={version.processedPngUrl}
          alt={version.versionId}
          style={{ imageRendering: "pixelated", maxWidth: "100%", maxHeight: 80 }}
        />
      </div>

      {/* Meta */}
      <div className="p-2 bg-zinc-900/80 space-y-0.5">
        <div className="flex items-center gap-1">
          {isApproved && (
            <span className="text-[10px] text-blue-400 font-bold">✓</span>
          )}
          {hasQA && (
            <span className="text-[10px] text-yellow-500" title={version.qaIssues.join("; ")}>⚠</span>
          )}
          <span className="text-[10px] font-mono text-zinc-400 truncate">{version.versionId}</span>
        </div>
        {version.costUsd != null && (
          <span className="text-[10px] text-zinc-600">${version.costUsd.toFixed(4)}</span>
        )}
      </div>
    </button>
  );
}
