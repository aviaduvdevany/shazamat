/**
 * GET /api/sprites/image?id=<assetId>&ver=<versionId>&type=raw|processed
 *
 * Streams a PNG from .sprites/assets/{id}/versions/{ver}/{type}.png.
 * Gate-kept by the admin session cookie so the workdir is never public.
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth";
import { rawPngPath, processedPngPath } from "@/game/sprites/lab/store";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ok = await isAuthenticated();
  if (!ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const ver = searchParams.get("ver");
  const type = searchParams.get("type") ?? "processed";

  if (!id || !ver) {
    return new NextResponse("Missing id or ver", { status: 400 });
  }

  const filePath =
    type === "raw" ? rawPngPath(id, ver) : processedPngPath(id, ver);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buf = fs.readFileSync(filePath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
