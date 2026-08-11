import { z } from "zod";

export const ShowSchema = z.object({
  date: z.string().min(1, "תאריך הוא שדה חובה"),
  city: z.string().min(1, "עיר היא שדה חובה"),
  venue: z.string().min(1, "מקום הוא שדה חובה"),
  ticketLink: z.string().url("קישור לא תקין").optional().or(z.literal("")),
  doorsTime: z.string().optional(),
  coverImage: z.string().optional(),
  coverWidth: z.number().int().positive().optional(),
  coverHeight: z.number().int().positive().optional(),
  coverBlurDataURL: z.string().optional(),
  isFeatured: z.boolean(),
});

export type ShowFormData = z.infer<typeof ShowSchema>;

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };
