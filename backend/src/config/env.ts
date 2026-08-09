import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  socketPort: parseInt(process.env.SOCKET_PORT || "4000", 10),

  databaseUrl: required("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/cocreate"),

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  elasticsearchUrl: process.env.ELASTICSEARCH_URL || "http://localhost:9200",

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev_access_secret_change_me"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret_change_me"),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
