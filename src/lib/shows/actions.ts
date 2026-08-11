"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { deleteCoverImage } from "@/lib/blob";
import { ShowSchema, type ShowFormData, type ActionResult } from "./schemas";

export type { ShowFormData, ActionResult };

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

export async function createShow(data: ShowFormData): Promise<ActionResult> {
  await requireAuth();

  const parsed = ShowSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { date, city, venue, ticketLink, doorsTime, coverImage, isFeatured } =
    parsed.data;

  try {
    if (isFeatured) {
      await prisma.$transaction(async (tx) => {
        await tx.show.updateMany({ data: { isFeatured: false } });
        await tx.show.create({
          data: {
            date: new Date(date),
            city,
            venue,
            ticketLink: ticketLink || null,
            doorsTime: doorsTime || null,
            coverImage: coverImage || null,
            isFeatured: true,
          },
        });
      });
    } else {
      await prisma.show.create({
        data: {
          date: new Date(date),
          city,
          venue,
          ticketLink: ticketLink || null,
          doorsTime: doorsTime || null,
          coverImage: coverImage || null,
          isFeatured: false,
        },
      });
    }
  } catch {
    return { success: false, error: "שגיאה ביצירת ההופעה" };
  }

  revalidatePath("/");
  revalidatePath("/admin/shows");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Update
// ────────────────────────────────────────────────────────────

export async function updateShow(
  id: string,
  data: ShowFormData
): Promise<ActionResult> {
  await requireAuth();

  const parsed = ShowSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { date, city, venue, ticketLink, doorsTime, coverImage, isFeatured } =
    parsed.data;

  try {
    if (isFeatured) {
      await prisma.$transaction(async (tx) => {
        await tx.show.updateMany({
          where: { id: { not: id } },
          data: { isFeatured: false },
        });
        await tx.show.update({
          where: { id },
          data: {
            date: new Date(date),
            city,
            venue,
            ticketLink: ticketLink || null,
            doorsTime: doorsTime || null,
            coverImage: coverImage || null,
            isFeatured: true,
          },
        });
      });
    } else {
      await prisma.show.update({
        where: { id },
        data: {
          date: new Date(date),
          city,
          venue,
          ticketLink: ticketLink || null,
          doorsTime: doorsTime || null,
          coverImage: coverImage || null,
          isFeatured: false,
        },
      });
    }
  } catch {
    return { success: false, error: "שגיאה בעדכון ההופעה" };
  }

  revalidatePath("/");
  revalidatePath("/admin/shows");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Delete
// ────────────────────────────────────────────────────────────

export async function deleteShow(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const show = await prisma.show.findUnique({ where: { id } });
    if (!show) return { success: false, error: "הופעה לא נמצאה" };

    if (
      show.coverImage &&
      show.coverImage.includes("blob.vercel-storage.com")
    ) {
      await deleteCoverImage(show.coverImage);
    }

    await prisma.show.delete({ where: { id } });
  } catch {
    return { success: false, error: "שגיאה במחיקת ההופעה" };
  }

  revalidatePath("/");
  revalidatePath("/admin/shows");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Toggle visibility (hide / show)
// ────────────────────────────────────────────────────────────

export async function toggleShowVisibility(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    const show = await prisma.show.findUnique({
      where: { id },
      select: { isHidden: true },
    });
    if (!show) return { success: false, error: "הופעה לא נמצאה" };

    await prisma.show.update({
      where: { id },
      data: { isHidden: !show.isHidden },
    });
  } catch {
    return { success: false, error: "שגיאה בעדכון ההופעה" };
  }

  revalidatePath("/");
  revalidatePath("/admin/shows");
  return { success: true };
}

// ────────────────────────────────────────────────────────────
// Set / clear featured
// ────────────────────────────────────────────────────────────

export async function setFeaturedShow(id: string): Promise<ActionResult> {
  await requireAuth();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.show.updateMany({ data: { isFeatured: false } });
      await tx.show.update({ where: { id }, data: { isFeatured: true } });
    });
  } catch {
    return { success: false, error: "שגיאה בהגדרת הופעה מודגשת" };
  }

  revalidatePath("/");
  revalidatePath("/admin/shows");
  return { success: true };
}

export async function clearFeaturedShow(): Promise<ActionResult> {
  await requireAuth();

  try {
    await prisma.show.updateMany({ data: { isFeatured: false } });
  } catch {
    return { success: false, error: "שגיאה בניקוי הופעה מודגשת" };
  }

  revalidatePath("/");
  revalidatePath("/admin/shows");
  return { success: true };
}
