"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { deleteCoverImage } from "@/lib/blob";
import { AlbumSchema, type AlbumFormData, type ActionResult } from "./schemas";

export type { AlbumFormData, ActionResult };

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) redirect("/admin/login");
}

function coverData(data: AlbumFormData) {
  return {
    coverImage: data.coverImage || null,
    coverWidth: data.coverWidth ?? null,
    coverHeight: data.coverHeight ?? null,
    coverBlurDataURL: data.coverBlurDataURL ?? null,
  };
}

// ────────────────────────────────────────────────────────────
// Create
// ────────────────────────────────────────────────────────────

export async function createAlbum(data: AlbumFormData): Promise<ActionResult> {
  await requireAuth();

  const parsed = AlbumSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { title, year, subtitle, spotify, appleMusic, isHidden } = parsed.data;

  try {
    await prisma.album.create({
      data: {
        title,
        year,
        subtitle: subtitle || null,
        spotify: spotify || null,
        appleMusic: appleMusic || null,
        isHidden,
        ...coverData(parsed.data),
      },
    });
  } catch {
    return { success: false, error: "שגיאה ביצירת האלבום" };
  }

  revalidateTag("albums");
  revalidatePath("/");
  revalidatePath("/admin/albums");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Update
// ────────────────────────────────────────────────────────────

export async function updateAlbum(
  id: string,
  data: AlbumFormData
): Promise<ActionResult> {
  await requireAuth();

  const parsed = AlbumSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { title, year, subtitle, spotify, appleMusic, isHidden } = parsed.data;

  try {
    // Delete orphaned Blob if cover was replaced or cleared
    const existing = await prisma.album.findUnique({
      where: { id },
      select: { coverImage: true },
    });
    const newCoverImage = parsed.data.coverImage || null;
    if (
      existing?.coverImage &&
      existing.coverImage.includes("blob.vercel-storage.com") &&
      existing.coverImage !== newCoverImage
    ) {
      await deleteCoverImage(existing.coverImage);
    }

    await prisma.album.update({
      where: { id },
      data: {
        title,
        year,
        subtitle: subtitle || null,
        spotify: spotify || null,
        appleMusic: appleMusic || null,
        isHidden,
        ...coverData(parsed.data),
      },
    });
  } catch {
    return { success: false, error: "שגיאה בעדכון האלבום" };
  }

  revalidateTag("albums");
  revalidatePath("/");
  revalidatePath("/admin/albums");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Delete
// ────────────────────────────────────────────────────────────

export async function deleteAlbum(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) return { success: false, error: "אלבום לא נמצא" };

    if (album.coverImage && album.coverImage.includes("blob.vercel-storage.com")) {
      await deleteCoverImage(album.coverImage);
    }

    await prisma.album.delete({ where: { id } });
  } catch {
    return { success: false, error: "שגיאה במחיקת האלבום" };
  }

  revalidateTag("albums");
  revalidatePath("/");
  revalidatePath("/admin/albums");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Toggle visibility
// ────────────────────────────────────────────────────────────

export async function toggleAlbumVisibility(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const album = await prisma.album.findUnique({
      where: { id },
      select: { isHidden: true },
    });
    if (!album) return { success: false, error: "אלבום לא נמצא" };

    await prisma.album.update({ where: { id }, data: { isHidden: !album.isHidden } });
  } catch {
    return { success: false, error: "שגיאה בעדכון האלבום" };
  }

  revalidateTag("albums");
  revalidatePath("/");
  revalidatePath("/admin/albums");
  return { success: true };
}
