import { api } from "../../shared/api/client";
import type {
  LoginInput,
  RegisterInput,
  TokenPair,
} from "../../shared/api/types";

export const authApi = {
  login(input: LoginInput) {
    return api.post<TokenPair>("auth/login", input, {
      auth: false,
      skipRefresh: true,
    });
  },
  register(input: RegisterInput) {
    return api.post<TokenPair>("auth/register", input, {
      auth: false,
      skipRefresh: true,
    });
  },
  logout(refreshToken: string | null) {
    return api.post<null>(
      "auth/logout",
      refreshToken ? { refresh_token: refreshToken } : {},
      { skipRefresh: true },
    );
  },
};
