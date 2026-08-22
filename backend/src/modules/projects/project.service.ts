import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { esClient, PROJECT_INDEX } from "../../config/elasticsearch";
import { cacheDel } from "../../config/redis";
import { logger } from "../../utils/logger";

interface RoleInput {
  title: string;
  compType?: string;
  compValue?: string;
  employment?: string;
  contractType?: string;
  compensation?: string;
  totalSpots?: number;
  filledSpots?: number;
  description?: string;
  requirements?: string[];
}

interface CreateProjectInput {
  title: string;
  description: string;
  companyName?: string;
  category?: string;
  location?: string;
  employment?: string;
  workType?: string;
  extraMembers?: number;
  tags?: string[];
  coverImageUrl?: string;
  roles?: RoleInput[];
}

export const projectService = {
  async create(ownerId: string, input: CreateProjectInput) {
    const { roles, ...projectData } = input;
    const project = await prisma.project.create({
      data: {
        ...projectData,
        ownerId,
        roles: roles && roles.length > 0
          ? {
              create: roles.map((r) => ({
                title: r.title,
                compType: r.compType,
                compValue: r.compValue,
                employment: r.employment,
                contractType: r.contractType,
                compensation: r.compensation,
                totalSpots: r.totalSpots ?? 1,
                filledSpots: r.filledSpots ?? 0,
                description: r.description,
                requirements: r.requirements ?? [],
              })),
            }
          : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        roles: true,
        collaborators: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    // Index in Elasticsearch for search (best-effort, non-blocking on failure)
    esClient
      .index({
        index: PROJECT_INDEX,
        id: project.id,
        document: {
          title: project.title,
          description: project.description,
          companyName: project.companyName,
          category: project.category,
          location: project.location,
          tags: project.tags,
          ownerId: project.ownerId,
          status: project.status,
          createdAt: project.createdAt,
        },
      })
      .catch((err) => logger.error(`ES index failed: ${err.message}`));

    return project;
  },

  async getById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        roles: true,
        collaborators: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!project) throw ApiError.notFound("Project not found");
    return project;
  },

  async listExplore(params?: {
    filter?: string;
    category?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.category) {
      where.category = params.category;
    }
    if (params?.role) {
      where.roles = {
        some: {
          title: { contains: params.role, mode: "insensitive" },
        },
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (params?.filter === "trending") {
      // In explore context, trending can prioritize projects with most active roles / recent activity
      orderBy = { updatedAt: "desc" };
    } else if (params?.filter === "new") {
      orderBy = { createdAt: "desc" };
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          roles: true,
          collaborators: {
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async listByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.count({
        where: {
          OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
        },
      }),
    ]);
    return { items, total, page, limit };
  },

  async update(id: string, ownerId: string, data: Record<string, unknown>) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw ApiError.notFound("Project not found");
    if (project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the owner can update this project");
    }

    const { roles, ...projectData } = data as any;

    if (roles && Array.isArray(roles)) {
      await prisma.role.deleteMany({ where: { projectId: id } });
      if (roles.length > 0) {
        await prisma.role.createMany({
          data: roles.map((r: any) => ({
            projectId: id,
            title: r.title,
            compType: r.compType,
            compValue: r.compValue,
            employment: r.employment,
            contractType: r.contractType,
            compensation: r.compensation,
            totalSpots: r.totalSpots ?? 1,
            filledSpots: r.filledSpots ?? 0,
            description: r.description,
            requirements: r.requirements ?? [],
          })),
        });
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: projectData,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        roles: true,
        collaborators: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    esClient
      .update({
        index: PROJECT_INDEX,
        id,
        doc: projectData,
      })
      .catch((err) => logger.error(`ES update failed: ${err.message}`));

    await cacheDel(`project:${id}`);
    return updated;
  },

  async remove(id: string, ownerId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw ApiError.notFound("Project not found");
    if (project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the owner can delete this project");
    }

    await prisma.projectCollaborator.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    esClient
      .delete({ index: PROJECT_INDEX, id })
      .catch((err) => logger.error(`ES delete failed: ${err.message}`));
  },

  async addCollaborator(
    projectId: string,
    ownerId: string,
    userId: string,
    role: "EDITOR" | "VIEWER"
  ) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw ApiError.notFound("Project not found");
    if (project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the owner can add collaborators");
    }

    return prisma.projectCollaborator.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
    });
  },

  async removeCollaborator(projectId: string, ownerId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw ApiError.notFound("Project not found");
    if (project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the owner can remove collaborators");
    }

    await prisma.projectCollaborator.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },
};
