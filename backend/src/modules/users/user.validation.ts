import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(80).optional(),
      bio: z.string().max(500).optional(),
      avatarUrl: z.string().url().optional(),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
