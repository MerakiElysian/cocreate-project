import { z } from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100),
    contractType: z.string().min(2).max(50),
    compensation: z.string().min(1).max(50),
    totalSpots: z.number().int().min(1).default(1),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>["body"];
