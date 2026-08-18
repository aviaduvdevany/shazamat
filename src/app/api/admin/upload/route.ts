import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Auth check runs here — browser requests (which have the admin
        // cookie) pass; Vercel Blob's upload-completed callback never reaches
        // this branch, so it isn't blocked.
        const ok = await isAuthenticated();
        if (!ok) throw new Error("Unauthorized");
        return {
          allowedContentTypes: ["image/webp"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          tokenPayload: JSON.stringify({ admin: true }),
        };
      },
      onUploadCompleted: async () => {
        // Vercel Blob calls this after the upload is confirmed.
        // Signature is verified by the SDK; no custom auth needed.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
