import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/cocreate_test",
      JWT_ACCESS_SECRET: "test_access_secret_0123456789012345678901234567890123456789",
      JWT_REFRESH_SECRET: "test_refresh_secret_0123456789012345678901234567890123456789",
      CORS_ORIGIN: "http://localhost:3000",
    },
  },
});
