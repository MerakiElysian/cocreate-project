import { Server, Socket } from "socket.io";
import { logger } from "../../utils/logger";

interface ChatMessagePayload {
  projectId: string;
  message: string;
}

interface PresencePayload {
  projectId: string;
}

export function registerChatHandlers(io: Server, socket: Socket) {
  socket.on("project:join", ({ projectId }: PresencePayload) => {
    socket.join(`project:${projectId}`);
    io.to(`project:${projectId}`).emit("presence:joined", {
      userId: socket.data.userId,
      projectId,
    });
    logger.info(`Socket ${socket.id} joined project:${projectId}`);
  });

  socket.on("project:leave", ({ projectId }: PresencePayload) => {
    socket.leave(`project:${projectId}`);
    io.to(`project:${projectId}`).emit("presence:left", {
      userId: socket.data.userId,
      projectId,
    });
  });

  socket.on("chat:message", ({ projectId, message }: ChatMessagePayload) => {
    const payload = {
      userId: socket.data.userId,
      projectId,
      message,
      timestamp: new Date().toISOString(),
    };
    io.to(`project:${projectId}`).emit("chat:message", payload);
  });

  socket.on("cursor:move", (data: { projectId: string; x: number; y: number }) => {
    socket.to(`project:${data.projectId}`).emit("cursor:move", {
      userId: socket.data.userId,
      x: data.x,
      y: data.y,
    });
  });
}
