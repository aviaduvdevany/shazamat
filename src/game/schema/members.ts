import { z } from "zod";

export const MEMBER_IDS = [
  "aviad",
  "itay",
  "nimrod",
  "shay",
  "reef",
  "nir",
  "gidon",
] as const;

export type MemberId = (typeof MEMBER_IDS)[number];

export const MemberIdSchema = z.enum(MEMBER_IDS);

export const MemberSchema = z.object({
  id: MemberIdSchema,
  name: z.string().min(1),
  role: z.string().min(1),
  description: z.string().min(1),
  endingBlurb: z.string().min(1),
  portraitId: z.string().min(1),
});

export type Member = z.infer<typeof MemberSchema>;
