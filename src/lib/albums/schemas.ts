import { z } from "zod";

export const AlbumSchema = z.object({
  title: z.string().min(1, "שם האלבום הוא שדה חובה"),
  year: z
    .number()
    .int()
    .min(1900, "שנה לא תקינה")
    .max(new Date().getFullYear() + 1, "שנה לא תקינה"),
  subtitle: z.string().optional(),
  coverImage: z.string().optional(),
  spotify: z.string().url("קישור לא תקין").optional().or(z.literal("")),
  appleMusic: z.string().url("קישור לא תקין").optional().or(z.literal("")),
  isHidden: z.boolean(),
});

export type AlbumFormData = z.infer<typeof AlbumSchema>;

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };
