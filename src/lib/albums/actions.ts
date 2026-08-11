"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { deleteCoverImage } from "@/lib/blob";
import { AlbumSchema, type AlbumFormData, type ActionResult } from "./schemas";

export type { AlbumFormData, ActionResult };

// ────────────────────────────────────────────────────────────
// Auth guard
// ────────────────────────────────────────────────────────────

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) redirect("/admin/login");
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

  const { title, year, subtitle, coverImage, spotify, appleMusic, isHidden } =
    parsed.data;

  try {
    await prisma.album.create({
      data: {
        title,
        year,
        subtitle: subtitle || null,
        coverImage: coverImage || null,
        spotify: spotify || null,
        appleMusic: appleMusic || null,
        isHidden,
      },
    });
  } catch {
    return { success: false, error: "שגיאה ביצירת האלבום" };
  }

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

  const { title, year, subtitle, coverImage, spotify, appleMusic, isHidden } =
    parsed.data;

  try {
    await prisma.album.update({
      where: { id },
      data: {
        title,
        year,
        subtitle: subtitle || null,
        coverImage: coverImage || null,
        spotify: spotify || null,
        appleMusic: appleMusic || null,
        isHidden,
      },
    });
  } catch {
    return { success: false, error: "שגיאה בעדכון האלבום" };
  }

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

    if (
      album.coverImage &&
      album.coverImage.includes("blob.vercel-storage.com")
    ) {
      await deleteCoverImage(album.coverImage);
    }

    await prisma.album.delete({ where: { id } });
  } catch {
    return { success: false, error: "שגיאה במחיקת האלבום" };
  }

  revalidatePath("/");
  revalidatePath("/admin/albums");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Toggle visibility (hide / show)
// ────────────────────────────────────────────────────────────

export async function toggleAlbumVisibility(
  id: string
): Promise<ActionResult> {
  await requireAuth();

  try {
    const album = await prisma.album.findUnique({
      where: { id },
      select: { isHidden: true },
    });
    if (!album) return { success: false, error: "אלבום לא נמצא" };

    await prisma.album.update({
      where: { id },
      data: { isHidden: !album.isHidden },
    });
  } catch {
    return { success: false, error: "שגיאה בעדכון האלבום" };
  }

  revalidatePath("/");
  revalidatePath("/admin/albums");
  return { success: true };
}
