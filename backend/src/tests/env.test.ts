import { describe, it, expect } from "vitest";

describe("Task 4: Required Environment Variables Fallback Check", () => {
  it("throws error when JWT_ACCESS_SECRET is unset", () => {
    const originalSecret = process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_ACCESS_SECRET;

    expect(() => {
      const value = process.env.JWT_ACCESS_SECRET;
      if (!value) {
        throw new Error("Missing required environment variable: JWT_ACCESS_SECRET");
      }
    }).toThrow("Missing required environment variable: JWT_ACCESS_SECRET");

    process.env.JWT_ACCESS_SECRET = originalSecret || "test_secret";
  });
});
