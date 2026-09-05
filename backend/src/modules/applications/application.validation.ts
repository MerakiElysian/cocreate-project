import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    coverNote: z.string().max(1000).optional(),
    portfolioUrl: z.string().url().optional(),
    counterOffer: z.string().optional(),
    counterStart: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }).optional(),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "WITHDRAWN"]),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>["body"];
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>["body"];
