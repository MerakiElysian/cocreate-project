import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "../modules/users/user.validation";
import { ZodError } from "zod";

describe("Task 2: User Profile Mass Assignment Validation", () => {
  it("should accept valid profile update fields", () => {
    const validData = {
      body: {
        name: "Jane Developer",
        bio: "Full-stack engineer building CoCreate",
        avatarUrl: "https://example.com/avatar.png",
      },
    };

    const parsed = updateProfileSchema.parse(validData);
    expect(parsed.body.name).toBe("Jane Developer");
    expect(parsed.body.bio).toBe("Full-stack engineer building CoCreate");
    expect(parsed.body.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("should reject payloads containing forbidden 'password' field", () => {
    const invalidData = {
      body: {
        name: "Hacker User",
        password: "newhackedpassword123",
      },
    };

    expect(() => updateProfileSchema.parse(invalidData)).toThrowError(ZodError);
  });

  it("should reject payloads containing forbidden 'email' field", () => {
    const invalidData = {
      body: {
        name: "Hacker User",
        email: "hacked@example.com",
      },
    };

    expect(() => updateProfileSchema.parse(invalidData)).toThrowError(ZodError);
  });

  it("should reject names shorter than 2 characters or longer than 80 characters", () => {
    const shortName = { body: { name: "A" } };
    const longName = { body: { name: "A".repeat(81) } };

    expect(() => updateProfileSchema.parse(shortName)).toThrowError(ZodError);
    expect(() => updateProfileSchema.parse(longName)).toThrowError(ZodError);
  });
});
