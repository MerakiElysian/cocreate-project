import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/apiError";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or invalid authorization header");
    }
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function optionalAuthenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = verifyAccessToken(header.split(" ")[1]);
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
