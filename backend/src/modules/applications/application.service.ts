import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { ApplicationStatus } from "@prisma/client";
import { CreateApplicationInput } from "./application.validation";

export const applicationService = {
  async applyToRole(
    roleId: string,
    applicantId: string,
    input: CreateApplicationInput
  ) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { project: true },
    });
    if (!role) throw ApiError.notFound("Role not found");
    if (role.project.ownerId === applicantId) {
      throw ApiError.badRequest("Project owners cannot apply to their own roles");
    }

    const existing = await prisma.application.findUnique({
      where: { roleId_applicantId: { roleId, applicantId } },
    });
    if (existing) {
      throw ApiError.conflict("You have already applied to this role");
    }

    return prisma.application.create({
      data: {
        roleId,
        applicantId,
        ...input,
      },
    });
  },

  async getApplicationsForRole(roleId: string, ownerId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { project: true },
    });
    if (!role) throw ApiError.notFound("Role not found");
    if (role.project.ownerId !== ownerId) {
      throw ApiError.forbidden("Only the project owner can view applications");
    }

    return prisma.application.findMany({
      where: { roleId },
      include: {
        applicant: {
          select: { id: true, name: true, email: true, avatarUrl: true, bio: true, skills: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateStatus(
    applicationId: string,
    userId: string,
    status: ApplicationStatus
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { role: { include: { project: true } } },
    });
    if (!application) throw ApiError.notFound("Application not found");

    if (status === "WITHDRAWN") {
      if (application.applicantId !== userId) {
        throw ApiError.forbidden("Only the applicant can withdraw their application");
      }
    } else {
      if (application.role.project.ownerId !== userId) {
        throw ApiError.forbidden("Only the project owner can update application status");
      }
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    if (status === "ACCEPTED" && application.status !== "ACCEPTED") {
      await prisma.role.update({
        where: { id: application.roleId },
        data: { filledSpots: { increment: 1 } },
      });
    }

    return updated;
  },
};
