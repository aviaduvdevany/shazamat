import { NextResponse } from "next/server";
import { getResults } from "@/lib/vote/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await getResults();
    return NextResponse.json(results, {
      headers: { "Cache-Control": "no-store, no-cache" },
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
