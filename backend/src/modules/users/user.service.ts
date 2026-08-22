import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { cacheGet, cacheSet, cacheDel } from "../../config/redis";

export const userService = {
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        skills: true,
        createdAt: true,
        ownedProjects: {
          include: {
            roles: true,
          },
          orderBy: { createdAt: "desc" },
        },
        collaborations: {
          include: {
            project: {
              include: {
                owner: { select: { id: true, name: true } },
              },
            },
          },
        },
        savedRoles: {
          include: {
            role: {
              include: {
                project: true,
              },
            },
          },
        },
        applications: {
          include: {
            role: {
              include: {
                project: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!user) throw ApiError.notFound("User not found");

    return user;
  },

  async updateProfile(
    id: string,
    data: { name?: string; bio?: string; avatarUrl?: string; skills?: string[] }
  ) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        skills: true,
        createdAt: true,
      },
    });
    await cacheDel(`user:${id}`);
    return user;
  },

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, name: true, email: true, avatarUrl: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);
    return { items, total, page, limit };
  },
};
