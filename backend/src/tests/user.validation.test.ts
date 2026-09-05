import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "../modules/users/user.validation";

describe("Task 2: User profile update validation (mass assignment prevention)", () => {
  it("rejects request body containing unexpected keys like 'password'", () => {
    const invalidBody = {
      name: "Valid Name",
      password: "hacked_password",
    };
    const result = updateProfileSchema.safeParse({ body: invalidBody });
    expect(result.success).toBe(false);
  });

  it("rejects request body containing unexpected keys like 'email'", () => {
    const invalidBody = {
      bio: "Hello world",
      email: "newemail@example.com",
    };
    const result = updateProfileSchema.safeParse({ body: invalidBody });
    expect(result.success).toBe(false);
  });

  it("accepts valid profile update fields", () => {
    const validBody = {
      name: "Valid Name",
      bio: "Software Engineer",
      avatarUrl: "https://example.com/avatar.png",
      skills: ["TypeScript", "Node.js"],
    };
    const result = updateProfileSchema.safeParse({ body: validBody });
    expect(result.success).toBe(true);
  });
});
