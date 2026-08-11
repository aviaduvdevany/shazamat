import { put, del } from "@vercel/blob";

export async function uploadCoverImage(file: File): Promise<string> {
  const filename = `shows/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "-")}`;
  const blob = await put(filename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });
  return blob.url;
}

export async function deleteCoverImage(url: string): Promise<void> {
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN! });
  } catch {
    // silently fail if blob no longer exists
  }
}
