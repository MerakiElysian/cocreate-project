import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(2000),
    coverImageUrl: z.string().url().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(10).max(2000).optional(),
    coverImageUrl: z.string().url().optional(),
    status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const addCollaboratorSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
