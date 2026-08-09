import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { initSocketServer } from "./sockets";
import { ensureIndices } from "./config/elasticsearch";
import { prisma } from "./config/db";

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Attach Socket.IO (with Redis adapter) to the same HTTP server
  initSocketServer(httpServer);

  // Verify DB connectivity
  await prisma.$connect();
  logger.info("PostgreSQL connected via Prisma");

  // Ensure Elasticsearch indices exist (non-fatal if ES is unavailable)
  await ensureIndices();

  httpServer.listen(env.port, () => {
    logger.info(`CoCreate API + Socket.IO running on port ${env.port} [${env.nodeEnv}]`);
  });

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");
    await prisma.$disconnect();
    httpServer.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
