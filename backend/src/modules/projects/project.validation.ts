import { z } from "zod";

const roleInputSchema = z.object({
  title: z.string().min(1).max(100),
  compType: z.string().optional(),
  compValue: z.string().optional(),
  employment: z.string().optional(),
  contractType: z.string().optional(),
  compensation: z.string().optional(),
  totalSpots: z.number().int().min(1).optional(),
  filledSpots: z.number().int().min(0).optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(2000),
    companyName: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    employment: z.string().optional(),
    workType: z.string().optional(),
    extraMembers: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
    coverImageUrl: z.string().url().optional(),
    roles: z.array(roleInputSchema).optional(),
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
