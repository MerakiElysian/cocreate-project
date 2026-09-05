import { describe, it, expect, vi } from "vitest";
import { isAuthorizedForProject, registerChatHandlers } from "../modules/chat/chat.gateway";
import { prisma } from "../config/db";

vi.mock("../config/db", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    chatMessage: {
      create: vi.fn(),
    },
  },
}));

describe("Task 3: Socket.IO Project Room Authorization", () => {
  it("returns false for non-member in isAuthorizedForProject", async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValueOnce(null);
    const authorized = await isAuthorizedForProject("user-123", "proj-456");
    expect(authorized).toBe(false);
  });

  it("emits error and blocks join for unauthorized user on project:join", async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValueOnce(null);

    const emittedEvents: Array<{ event: string; payload: any }> = [];
    const joinedRooms: string[] = [];

    const socket: any = {
      id: "socket-123",
      data: { userId: "unauthorized-user" },
      emit: (event: string, payload: any) => {
        emittedEvents.push({ event, payload });
      },
      join: (room: string) => {
        joinedRooms.push(room);
      },
      on: vi.fn(),
    };

    const io: any = { to: vi.fn() };

    let joinHandler: Function | null = null;
    socket.on.mockImplementation((event: string, handler: Function) => {
      if (event === "project:join") joinHandler = handler;
    });

    registerChatHandlers(io, socket);
    expect(joinHandler).not.toBeNull();

    await joinHandler!({ projectId: "proj-secret" });

    expect(emittedEvents).toContainEqual({
      event: "error",
      payload: { message: "Not authorized to join this project" },
    });
    expect(joinedRooms).not.toContain("project:proj-secret");
  });
});
