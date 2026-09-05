import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { esClient, PROJECT_INDEX } from "../../config/elasticsearch";
import { cacheDel } from "../../config/redis";
import { logger } from "../../utils/logger";

interface CreateProjectInput {
  title: string;
  description: string;
  coverImageUrl?: string;
}

export const projectService = {
  async create(ownerId: string, input: CreateProjectInput) {
    const project = await prisma.project.create({
      data: { ...input, ownerId },
    });

    // Index in Elasticsearch for search (best-effort, non-blocking on failure)
    esClient
      .index({
        index: PROJECT_INDEX,
        id: project.id,
        document: {
          title: project.title,
          description: project.description,
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
        collaborators: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
    if (!project) throw ApiError.notFound("Project not found");
    return project;
  },

  async listByUser(userId: string, page = 1, limit = 20) {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * safeLimit;
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
        },
        skip,
        take: safeLimit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.count({
        where: {
          OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
        },
      }),
    ]);
    return { items, total, page, limit: safeLimit };
  },

  async update(id: string, userId: string, data: Record<string, unknown>) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { collaborators: { where: { userId } } },
    });
    if (!project) throw ApiError.notFound("Project not found");

    const isOwner = project.ownerId === userId;
    const userCollab = project.collaborators[0];
    const isEditor = userCollab?.role === "EDITOR" || userCollab?.role === "OWNER";

    if (!isOwner && !isEditor) {
      throw ApiError.forbidden("Only project owners and editors can update this project");
    }

    const updated = await prisma.project.update({ where: { id }, data });

    esClient
      .update({
        index: PROJECT_INDEX,
        id,
        doc: data,
      })
      .catch((err) => logger.error(`ES update failed: ${err.message}`));

    await cacheDel(`project:${id}`);
    return updated;
  },

  async remove(id: string, ownerId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw ApiError.notFound("Project not found");
    if (project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the project owner can delete this project");
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
      throw ApiError.forbidden("Only the project owner can add collaborators");
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
      throw ApiError.forbidden("Only the project owner can remove collaborators");
    }

    await prisma.projectCollaborator.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  async getMessages(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
      },
    });
    if (!project) {
      throw ApiError.forbidden("Access denied to project chat history");
    }

    return prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },
};
