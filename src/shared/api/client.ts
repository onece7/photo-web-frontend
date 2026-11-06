import type { ApiResponse, TokenPair } from "./types";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./token-store";

const configuredBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const API_BASE = configuredBase.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
  retried?: boolean;
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
let refreshPromise: Promise<string> | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}

function parseEnvelope<T>(payload: unknown, status: number): T {
  const envelope = payload as ApiResponse<T> | null;

  if (
    !envelope ||
    typeof envelope !== "object" ||
    typeof envelope.code !== "number"
  ) {
    if (status >= 200 && status < 300) {
      return payload as T;
    }
    throw new ApiError("服务器返回了无法识别的响应", status, 50000);
  }

  if (status < 200 || status >= 300 || envelope.code !== 0) {
    throw new ApiError(
      envelope.message || "请求失败，请稍后重试",
      status,
      envelope.code,
    );
  }

  return envelope.data as T;
}

async function readResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text || null;
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError("登录已失效，请重新登录", 401, 40100);
  }

  refreshPromise = (async () => {
    const response = await fetch(buildUrl("auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const payload = await readResponse(response);
    const tokens = parseEnvelope<TokenPair>(payload, response.status);
    saveTokens(tokens);
    return tokens.access_token;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    clearTokens();
    unauthorizedHandler?.();
    throw error;
  } finally {
    refreshPromise = null;
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    auth = true,
    skipRefresh = false,
    retried = false,
    headers,
    ...init
  } = options;
  const requestHeaders = new Headers(headers);
  const accessToken = getAccessToken();

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (auth && accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await readResponse(response);

  try {
    return parseEnvelope<T>(payload, response.status);
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    const canRefresh =
      response.status === 401 &&
      auth &&
      !skipRefresh &&
      !retried &&
      Boolean(getRefreshToken());

    if (canRefresh) {
      try {
        await refreshAccessToken();
      } catch (refreshError) {
        throw refreshError;
      }
      return request<T>(path, { ...options, retried: true });
    }

    if (response.status === 401 && !skipRefresh) {
      clearTokens();
      unauthorizedHandler?.();
    }
    throw error;
  }
}

export const api = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "POST", body });
  },
  delete<T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};

export function resolveImageUrl(imageUrl?: string): string | null {
  if (!imageUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      const imageOrigin = new URL(imageUrl).origin;
      const apiOrigin = /^https?:\/\//i.test(API_BASE)
        ? new URL(API_BASE).origin
        : window.location.origin;
      return imageOrigin === apiOrigin ? imageUrl : null;
    } catch {
      return null;
    }
  }

  const normalized = imageUrl
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");
  const encoded = normalized
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return encoded ? `${API_BASE}/files/${encoded}` : null;
}

export function getErrorMessage(
  error: unknown,
  fallback = "操作失败，请稍后重试",
): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 40300:
        return "你没有权限访问该资源";
      case 40400:
      case 44000:
        return "记录不存在或已被删除";
      case 40900:
        return error.message || "用户名或手机号已被占用";
      case 42002:
        return "生成队列繁忙，请稍后再试";
      case 42900:
        return "请求过于频繁，请稍后再试";
      default:
        return error.message || fallback;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
