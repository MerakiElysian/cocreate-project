import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { cacheGet, cacheSet, cacheDel } from "../../config/redis";
import { UpdateProfileInput } from "./user.validation";

export const userService = {
  async getById(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });
    if (!user) throw ApiError.notFound("User not found");

    await cacheSet(cacheKey, user, 300);
    return user;
  },

  async updateProfile(id: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await cacheDel(`user:${id}`);
    return user;
  },

  async listUsers(page = 1, limit = 20) {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * safeLimit;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: safeLimit,
        select: { id: true, name: true, email: true, avatarUrl: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);
    return { items, total, page, limit: safeLimit };
  },
};
