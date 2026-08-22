import { z } from "zod";

const roleInputSchema = z.object({
  title: z.string().min(2).max(100),
  compType: z.string().optional(),
  compValue: z.string().optional(),
  employment: z.string().optional(),
  contractType: z.string().optional(),
  compensation: z.string().optional(),
  totalSpots: z.number().int().positive().default(1),
  filledSpots: z.number().int().min(0).default(0),
  description: z.string().max(2000).optional(),
  requirements: z.array(z.string()).default([]),
});

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(4000),
    companyName: z.string().max(120).optional(),
    category: z.string().max(60).optional(),
    location: z.string().max(100).default("Remote"),
    employment: z.string().max(60).optional(),
    workType: z.string().max(60).default("Remote"),
    extraMembers: z.number().int().min(0).default(0),
    tags: z.array(z.string()).default([]),
    coverImageUrl: z.string().optional(),
    roles: z.array(roleInputSchema).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(10).max(4000).optional(),
    companyName: z.string().max(120).optional(),
    category: z.string().max(60).optional(),
    location: z.string().max(100).optional(),
    employment: z.string().max(60).optional(),
    workType: z.string().max(60).optional(),
    extraMembers: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
    coverImageUrl: z.string().optional(),
    roles: z.array(roleInputSchema).optional(),
    status: z
      .enum([
        "RECRUITING",
        "HIRING",
        "IN_PROGRESS",
        "CLOSED",
        "ACTIVE",
        "ARCHIVED",
        "COMPLETED",
      ])
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const addCollaboratorSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    title: z.string().max(100).optional(),
    role: z.enum(["OWNER", "EDITOR", "VIEWER"]).default("EDITOR"),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const createRoleSchema = z.object({
  body: roleInputSchema,
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

