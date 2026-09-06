"use client";

import { useState, useMemo } from "react";
import type { AssetStatusRow } from "./actions";
import type { AssetBatch, AssetFamily } from "@/game/sprites/lab/inventory";

interface Props {
  rows: AssetStatusRow[];
}

const STATUS_DOT: Record<string, string> = {
  missing: "bg-zinc-600",
  drafted: "bg-yellow-500/70",
  approved: "bg-blue-400",
  live: "bg-green-400",
};

const BATCH_COLORS: Record<AssetBatch, string> = {
  A: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  B: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  C: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
};

const FAMILIES: AssetFamily[] = ["look", "scene", "portrait", "ui"];

export function InventoryGrid({ rows }: Props) {
  const [batchFilter, setBatchFilter] = useState<AssetBatch | "all">("all");
  const [familyFilter, setFamilyFilter] = useState<AssetFamily | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (batchFilter !== "all" && r.batch !== batchFilter) return false;
      if (familyFilter !== "all" && r.family !== familyFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, batchFilter, familyFilter, statusFilter]);

  // Group by family
  const grouped = useMemo(() => {
    const groups: Record<string, AssetStatusRow[]> = {};
    for (const row of filtered) {
      if (!groups[row.family]) groups[row.family] = [];
      groups[row.family].push(row);
    }
    return groups;
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { missing: 0, drafted: 0, approved: 0, live: 0 };
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: "missing", label: "Missing", color: "text-zinc-400" },
          { key: "drafted", label: "Drafted", color: "text-yellow-400" },
          { key: "approved", label: "Approved", color: "text-blue-400" },
          { key: "live", label: "Live", color: "text-green-400" },
        ].map((s) => (
          <div
            key={s.key}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{counts[s.key] ?? 0}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-zinc-500">Filter:</span>

        {(["all", "A", "B", "C"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBatchFilter(b)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              batchFilter === b
                ? "bg-zinc-700 border-zinc-500 text-white"
                : "border-zinc-700 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {b === "all" ? "All batches" : `Batch ${b}`}
          </button>
        ))}

        <span className="text-zinc-700">|</span>

        <select
          value={familyFilter}
          onChange={(e) => setFamilyFilter(e.target.value as AssetFamily | "all")}
          className="px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none"
        >
          <option value="all">All families</option>
          {FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="missing">Missing</option>
          <option value="drafted">Drafted</option>
          <option value="approved">Approved</option>
          <option value="live">Live</option>
        </select>

        <span className="text-xs text-zinc-600 ml-1">{filtered.length} assets</span>
      </div>

      {/* Grouped grid */}
      {Object.entries(grouped).map(([family, familyRows]) => (
        <div key={family}>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            {family}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {familyRows.map((row) => (
              <AssetCard key={row.id} row={row} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-600">No assets match the current filters.</div>
      )}
    </div>
  );
}

function AssetCard({ row }: { row: AssetStatusRow }) {
  const batchStyle = BATCH_COLORS[row.batch];
  const dotColor = STATUS_DOT[row.status] ?? "bg-zinc-600";

  return (
    <a
      href={`/admin/game/sprites/${row.id}`}
      className="group flex items-start gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:bg-zinc-800/60 transition-all"
    >
      {/* Status dot */}
      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-mono text-white truncate">{row.id}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${batchStyle}`}
          >
            {row.batch}
          </span>
          {row.diskStatus === "REPLACE" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-500 flex-shrink-0">
              REPLACE
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-500">
          {row.canvas[0]}×{row.canvas[1]} · {row.model}
          {row.versions > 0 && ` · ${row.versions} ver`}
          {row.approvedVersionId && " · ✓"}
        </div>
      </div>

      <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-sm flex-shrink-0">
        →
      </span>
    </a>
  );
}
