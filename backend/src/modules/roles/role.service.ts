import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { CreateRoleInput, UpdateRoleInput } from "./role.validation";

export const roleService = {
  async createRole(projectId: string, ownerId: string, input: CreateRoleInput) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw ApiError.notFound("Project not found");
    if (project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the project owner can create roles");
    }

    return prisma.role.create({
      data: {
        ...input,
        projectId,
      },
    });
  },

  async updateRole(roleId: string, ownerId: string, input: UpdateRoleInput) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { project: true },
    });
    if (!role) throw ApiError.notFound("Role not found");
    if (role.project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the project owner can edit this role");
    }

    return prisma.role.update({
      where: { id: roleId },
      data: input,
    });
  },

  async deleteRole(roleId: string, ownerId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { project: true },
    });
    if (!role) throw ApiError.notFound("Role not found");
    if (role.project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the project owner can remove this role");
    }

    await prisma.role.delete({ where: { id: roleId } });
  },

  async getRolesByProject(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw ApiError.notFound("Project not found");

    return prisma.role.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  async saveRole(roleId: string, userId: string) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw ApiError.notFound("Role not found");

    return prisma.savedRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      create: { userId, roleId },
      update: {},
    });
  },

  async unsaveRole(roleId: string, userId: string) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw ApiError.notFound("Role not found");

    await prisma.savedRole.deleteMany({
      where: { userId, roleId },
    });
  },
};
