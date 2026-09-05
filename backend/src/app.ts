import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { globalLimiter } from "./middlewares/rateLimiter.middleware";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import projectRoutes from "./modules/projects/project.routes";
import searchRoutes from "./modules/search/search.routes";
import uploadRoutes from "./modules/uploads/upload.routes";
import roleRoutes from "./modules/roles/role.routes";
import applicationRoutes from "./modules/applications/application.routes";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use(globalLimiter);

  app.get("/", (_req, res) => {
    res.json({ success: true, message: "CoCreate API root — see /health and /api/*" });
  });

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "CoCreate API is healthy", env: env.nodeEnv });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/roles", roleRoutes);
  app.use("/api/applications", applicationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
