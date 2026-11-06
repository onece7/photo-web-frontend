import { describe, expect, it, vi } from "vitest";
import {
  ApiError,
  request,
  setUnauthorizedHandler,
} from "./client";

describe("access token refresh", () => {
  it("shares one refresh request across concurrent 401 responses", async () => {
    const validToken = "header.eyJ1c2VybmFtZSI6ImNyZWF0b3IifQ.signature";
    let protectedCalls = 0;
    let refreshCalls = 0;
    const protectedAuthorizations: Array<string | null> = [];

    sessionStorage.setItem("photo-web:access-token", "expired-token");
    localStorage.setItem("photo-web:refresh-token", "refresh-token");

    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const headers = new Headers(init?.headers);

        if (url.endsWith("/auth/refresh")) {
          refreshCalls += 1;
          await new Promise((resolve) => setTimeout(resolve, 15));
          return jsonResponse({
            code: 0,
            message: "success",
            data: {
              access_token: validToken,
              refresh_token: "rotated-refresh-token",
              expires_in: 900,
            },
          });
        }

        protectedCalls += 1;
        protectedAuthorizations.push(headers.get("Authorization"));
        if (headers.get("Authorization") === "Bearer expired-token") {
          return jsonResponse(
            { code: 40101, message: "Token 已过期" },
            401,
          );
        }
        return jsonResponse({
          code: 0,
          message: "success",
          data: { ok: true },
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      request<{ ok: boolean }>("protected/one"),
      request<{ ok: boolean }>("protected/two"),
    ]);

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
    expect(protectedCalls).toBe(4);
    expect(protectedAuthorizations.slice(2)).toEqual([
      `Bearer ${validToken}`,
      `Bearer ${validToken}`,
    ]);
    expect(localStorage.getItem("photo-web:refresh-token")).toBe(
      "rotated-refresh-token",
    );
  });

  it("clears the session when refresh fails", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    sessionStorage.setItem("photo-web:access-token", "expired-token");
    localStorage.setItem("photo-web:refresh-token", "invalid-refresh-token");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith("/auth/refresh")) {
          return jsonResponse(
            { code: 40100, message: "无效的 Refresh Token" },
            401,
          );
        }
        return jsonResponse(
          { code: 40101, message: "Token 已过期" },
          401,
        );
      }),
    );

    await expect(request("protected/one")).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem("photo-web:access-token")).toBeNull();
    expect(localStorage.getItem("photo-web:refresh-token")).toBeNull();
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
