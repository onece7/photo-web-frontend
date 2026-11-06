import { describe, expect, it } from "vitest";
import { ApiError, getErrorMessage, resolveImageUrl } from "./client";

describe("resolveImageUrl", () => {
  it("normalizes a backend upload path", () => {
    expect(resolveImageUrl("\\generated\\folder\\image 01.png")).toBe(
      "/api/v1/files/generated/folder/image%2001.png",
    );
  });

  it("returns null for an empty path", () => {
    expect(resolveImageUrl()).toBeNull();
    expect(resolveImageUrl("")).toBeNull();
  });

  it("rejects an image URL from an untrusted origin", () => {
    expect(resolveImageUrl("https://images.example.com/a.png")).toBeNull();
  });
});

describe("getErrorMessage", () => {
  it("maps known business codes to user-facing messages", () => {
    expect(getErrorMessage(new ApiError("raw", 429, 42900))).toContain(
      "请求过于频繁",
    );
    expect(getErrorMessage(new ApiError("raw", 403, 40300))).toContain(
      "没有权限",
    );
  });
});
