import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redisClient = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("error", (err) => logger.error(`Redis error: ${err.message}`));

// Cache helpers used across services
export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redisClient.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  await redisClient.del(key);
}
