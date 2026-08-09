import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { registerChatHandlers } from "../modules/chat/chat.gateway";

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  });

  // Redis adapter enables horizontal scaling across multiple Node instances
  const pubClient = new Redis(env.redisUrl);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Authenticate every socket connection using the JWT access token
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        return next(new Error("Authentication token missing"));
      }
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.data.userId})`);

    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
