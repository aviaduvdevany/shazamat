import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[upload] POST received", {
    url: request.url,
    contentType: request.headers.get("content-type"),
    hasCookie: !!request.cookies.get("admin_session"),
  });

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
    console.log("[upload] body type:", (body as { type?: string }).type);
  } catch (parseError) {
    console.error("[upload] failed to parse body:", parseError);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        console.log("[upload] onBeforeGenerateToken called");
        const ok = await isAuthenticated();
        console.log("[upload] isAuthenticated:", ok);
        if (!ok) throw new Error("Unauthorized");
        return {
          allowedContentTypes: ["image/webp"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          tokenPayload: JSON.stringify({ admin: true }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[upload] onUploadCompleted:", blob.url);
      },
    });

    console.log("[upload] handleUpload success:", JSON.stringify(jsonResponse));
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[upload] handleUpload error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
