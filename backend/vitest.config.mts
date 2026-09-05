import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/cocreate_test",
      JWT_ACCESS_SECRET: "test_jwt_access_secret_key_for_vitest_123",
      JWT_REFRESH_SECRET: "test_jwt_refresh_secret_key_for_vitest_123",
    },
  },
});
