import { create } from "zustand";
import {
  clearTokens,
  decodeTokenUsername,
  getAccessToken,
  getStoredUsername,
  saveTokens,
  saveUsername,
} from "../../shared/api/token-store";
import type { TokenPair } from "../../shared/api/types";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  setSession: (tokens: TokenPair, username: string) => void;
  clearSession: () => void;
}

const initialToken = getAccessToken();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(initialToken),
  username:
    getStoredUsername() || decodeTokenUsername(initialToken) || null,
  setSession: (tokens, username) => {
    saveTokens(tokens);
    saveUsername(username);
    set({ isAuthenticated: true, username });
  },
  clearSession: () => {
    clearTokens();
    set({ isAuthenticated: false, username: null });
  },
}));
