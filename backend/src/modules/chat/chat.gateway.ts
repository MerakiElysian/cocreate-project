import { Server, Socket } from "socket.io";
import { logger } from "../../utils/logger";
import { prisma } from "../../config/db";

interface ChatMessagePayload {
  projectId: string;
  message: string;
}

interface PresencePayload {
  projectId: string;
}

export async function isAuthorizedForProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  if (!userId || !projectId) return false;
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
    },
    select: { id: true },
  });
  return !!project;
}

export function registerChatHandlers(io: Server, socket: Socket) {
  socket.on("project:join", async ({ projectId }: PresencePayload) => {
    const userId = socket.data.userId;
    if (!projectId || !(await isAuthorizedForProject(userId, projectId))) {
      socket.emit("error", { message: "Unauthorized access to project room" });
      return;
    }

    if (!socket.data.verifiedProjects) {
      socket.data.verifiedProjects = new Set<string>();
    }
    socket.data.verifiedProjects.add(projectId);

    socket.join(`project:${projectId}`);
    io.to(`project:${projectId}`).emit("presence:joined", {
      userId,
      projectId,
    });
    logger.info(`Socket ${socket.id} (user ${userId}) joined project:${projectId}`);
  });

  socket.on("project:leave", ({ projectId }: PresencePayload) => {
    if (socket.data.verifiedProjects) {
      socket.data.verifiedProjects.delete(projectId);
    }
    socket.leave(`project:${projectId}`);
    io.to(`project:${projectId}`).emit("presence:left", {
      userId: socket.data.userId,
      projectId,
    });
  });

  socket.on("chat:message", async ({ projectId, message }: ChatMessagePayload) => {
    const userId = socket.data.userId;
    let isAuth = socket.data.verifiedProjects?.has(projectId);
    if (!isAuth) {
      isAuth = await isAuthorizedForProject(userId, projectId);
      if (isAuth) {
        if (!socket.data.verifiedProjects) socket.data.verifiedProjects = new Set<string>();
        socket.data.verifiedProjects.add(projectId);
      }
    }

    if (!isAuth) {
      socket.emit("error", { message: "Unauthorized to send messages in this project" });
      return;
    }

    const payload = {
      userId,
      projectId,
      message,
      timestamp: new Date().toISOString(),
    };
    io.to(`project:${projectId}`).emit("chat:message", payload);

    prisma.chatMessage
      .create({
        data: {
          projectId,
          senderId: userId,
          message,
        },
      })
      .catch((err) => {
        logger.error(`Failed to persist chat message for project ${projectId}:`, err);
      });
  });

  socket.on(
    "cursor:move",
    async (data: { projectId: string; x: number; y: number }) => {
      const userId = socket.data.userId;
      let isAuth = socket.data.verifiedProjects?.has(data.projectId);
      if (!isAuth) {
        isAuth = await isAuthorizedForProject(userId, data.projectId);
        if (isAuth) {
          if (!socket.data.verifiedProjects) socket.data.verifiedProjects = new Set<string>();
          socket.data.verifiedProjects.add(data.projectId);
        }
      }

      if (!isAuth) {
        socket.emit("error", { message: "Unauthorized to send cursor position in this project" });
        return;
      }

      socket.to(`project:${data.projectId}`).emit("cursor:move", {
        userId,
        x: data.x,
        y: data.y,
      });
    }
  );
}
