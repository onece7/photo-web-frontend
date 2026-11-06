import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

describe("auth schemas", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      username: "photo_user",
      phone: "13800138000",
      password: "secure123",
      confirmPassword: "secure123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid phone number and mismatched password", () => {
    const result = registerSchema.safeParse({
      username: "ab",
      phone: "123",
      password: "secure123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toContain("username");
      expect(fields).toContain("phone");
      expect(fields).toContain("confirmPassword");
    }
  });

  it("requires login credentials", () => {
    expect(
      loginSchema.safeParse({ username: "", password: "" }).success,
    ).toBe(false);
  });
});
