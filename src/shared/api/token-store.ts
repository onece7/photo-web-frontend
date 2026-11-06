import type { TokenPair } from "./types";

const ACCESS_TOKEN_KEY = "photo-web:access-token";
const REFRESH_TOKEN_KEY = "photo-web:refresh-token";
const USERNAME_KEY = "photo-web:username";
const RETURN_TO_KEY = "photo-web:return-to";

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
}

function remove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage availability errors.
  }
}

export function getAccessToken(): string | null {
  return read(sessionStorage, ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return read(localStorage, REFRESH_TOKEN_KEY);
}

export function getStoredUsername(): string | null {
  return read(localStorage, USERNAME_KEY);
}

export function saveTokens(tokens: TokenPair): void {
  write(sessionStorage, ACCESS_TOKEN_KEY, tokens.access_token);
  write(localStorage, REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function saveUsername(username: string): void {
  write(localStorage, USERNAME_KEY, username);
}

export function clearTokens(): void {
  remove(sessionStorage, ACCESS_TOKEN_KEY);
  remove(localStorage, REFRESH_TOKEN_KEY);
  remove(localStorage, USERNAME_KEY);
}

export function saveReturnTo(path: string): void {
  write(sessionStorage, RETURN_TO_KEY, path);
}

export function consumeReturnTo(): string | null {
  const value = read(sessionStorage, RETURN_TO_KEY);
  remove(sessionStorage, RETURN_TO_KEY);
  return value;
}

export function decodeTokenUsername(token: string | null): string | null {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(normalized)) as { username?: unknown };
    return typeof decoded.username === "string" ? decoded.username : null;
  } catch {
    return null;
  }
}
