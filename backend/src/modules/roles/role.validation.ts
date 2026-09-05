import { z } from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100),
    compType: z.string().optional(),
    compValue: z.string().optional(),
    employment: z.string().optional(),
    contractType: z.string().optional(),
    compensation: z.string().optional(),
    totalSpots: z.number().int().min(1).default(1),
    description: z.string().optional(),
    requirements: z.array(z.string()).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }).optional(),
});

export const updateRoleSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100).optional(),
    compType: z.string().optional(),
    compValue: z.string().optional(),
    employment: z.string().optional(),
    contractType: z.string().optional(),
    compensation: z.string().optional(),
    totalSpots: z.number().int().min(1).optional(),
    description: z.string().optional(),
    requirements: z.array(z.string()).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>["body"];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];
