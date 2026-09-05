import { describe, it, expect, vi, beforeEach } from "vitest";
import { isAuthorizedForProject } from "../modules/chat/chat.gateway";
import { prisma } from "../config/db";

vi.mock("../config/db", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Task 3: Socket.IO Project Room Authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return false if userId or projectId is missing", async () => {
    expect(await isAuthorizedForProject("", "proj-123")).toBe(false);
    expect(await isAuthorizedForProject("user-123", "")).toBe(false);
  });

  it("should return true if user is owner of the project", async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValueOnce({ id: "proj-123" } as any);

    const result = await isAuthorizedForProject("owner-1", "proj-123");
    expect(result).toBe(true);
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: "proj-123",
        OR: [
          { ownerId: "owner-1" },
          { collaborators: { some: { userId: "owner-1" } } },
        ],
      },
      select: { id: true },
    });
  });

  it("should return false if user is neither owner nor collaborator", async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValueOnce(null);

    const result = await isAuthorizedForProject("outsider-user", "proj-123");
    expect(result).toBe(false);
  });
});
