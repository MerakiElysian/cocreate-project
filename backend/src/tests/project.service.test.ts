import { describe, it, expect, vi, beforeEach } from "vitest";
import { projectService } from "../modules/projects/project.service";
import { prisma } from "../config/db";
import { ApiError } from "../utils/apiError";

vi.mock("../config/db", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    projectCollaborator: {
      deleteMany: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("../config/elasticsearch", () => ({
  esClient: {
    update: vi.fn().mockReturnValue(Promise.resolve()),
    delete: vi.fn().mockReturnValue(Promise.resolve()),
  },
  PROJECT_INDEX: "projects",
}));

vi.mock("../config/redis", () => ({
  cacheDel: vi.fn().mockResolvedValue(true),
}));

describe("Task 8: Project Ownership and Collaborator Role Checks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("projectService.update", () => {
    it("should allow project owner to update project", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "proj-1",
        ownerId: "owner-123",
        collaborators: [],
      } as any);

      vi.mocked(prisma.project.update).mockResolvedValueOnce({
        id: "proj-1",
        title: "Updated Title",
      } as any);

      const result = await projectService.update("proj-1", "owner-123", {
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
    });

    it("should allow EDITOR collaborator to update project", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "proj-1",
        ownerId: "owner-123",
        collaborators: [{ role: "EDITOR" }],
      } as any);

      vi.mocked(prisma.project.update).mockResolvedValueOnce({
        id: "proj-1",
        title: "Updated Title",
      } as any);

      const result = await projectService.update("proj-1", "editor-user", {
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
    });

    it("should deny VIEWER collaborator from updating project", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "proj-1",
        ownerId: "owner-123",
        collaborators: [{ role: "VIEWER" }],
      } as any);

      await expect(
        projectService.update("proj-1", "viewer-user", { title: "Hacked Title" })
      ).rejects.toThrowError(ApiError);
    });

    it("should deny non-collaborators from updating project", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "proj-1",
        ownerId: "owner-123",
        collaborators: [],
      } as any);

      await expect(
        projectService.update("proj-1", "stranger-user", { title: "Hacked Title" })
      ).rejects.toThrowError(ApiError);
    });
  });

  describe("projectService.remove", () => {
    it("should allow owner to delete project", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "proj-1",
        ownerId: "owner-123",
      } as any);

      await projectService.remove("proj-1", "owner-123");
      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: "proj-1" } });
    });

    it("should deny EDITOR from deleting project", async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
        id: "proj-1",
        ownerId: "owner-123",
      } as any);

      await expect(projectService.remove("proj-1", "editor-user")).rejects.toThrowError(
        ApiError
      );
    });
  });
});
