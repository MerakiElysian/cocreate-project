import { describe, it, expect, vi } from "vitest";
import { projectService } from "../modules/projects/project.service";
import { prisma } from "../config/db";

vi.mock("../config/db", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    projectCollaborator: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("../config/elasticsearch", () => ({
  esClient: {
    index: vi.fn().mockReturnValue(Promise.resolve()),
    update: vi.fn().mockReturnValue(Promise.resolve()),
    delete: vi.fn().mockReturnValue(Promise.resolve()),
  },
  PROJECT_INDEX: "projects",
}));

vi.mock("../config/redis", () => ({
  cacheDel: vi.fn().mockResolvedValue(true),
}));

describe("Task 5 & Project Ownership: Security access controls", () => {
  it("prevents non-owner from updating someone else's project (throws 403)", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
      id: "proj-123",
      ownerId: "owner-user-id",
    } as any);

    await expect(
      projectService.update("proj-123", "attacker-user-id", { title: "Hacked Title" })
    ).rejects.toThrow("Only the owner can update this project");
  });

  it("prevents non-owner from deleting someone else's project (throws 403)", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
      id: "proj-123",
      ownerId: "owner-user-id",
    } as any);

    await expect(
      projectService.remove("proj-123", "attacker-user-id")
    ).rejects.toThrow("Only the owner can delete this project");
  });

  it("allows owner to update their own project", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
      id: "proj-123",
      ownerId: "owner-user-id",
    } as any);
    vi.mocked(prisma.project.update).mockResolvedValueOnce({
      id: "proj-123",
      title: "Updated Title",
    } as any);

    const updated = await projectService.update("proj-123", "owner-user-id", {
      title: "Updated Title",
    });
    expect(updated.title).toBe("Updated Title");
  });
});
