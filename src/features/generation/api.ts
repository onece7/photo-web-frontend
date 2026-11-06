import { api } from "../../shared/api/client";
import type {
  GenerateResponse,
  GenerationState,
  ImageStyle,
  ProGenerateInput,
  SimpleGenerateInput,
} from "../../shared/api/types";

export const generationApi = {
  getStyles() {
    return api.get<ImageStyle[]>("generate/styles", {
      auth: false,
      skipRefresh: true,
    });
  },
  generateSimple(input: SimpleGenerateInput) {
    return api.post<GenerateResponse>("generate/simple", input);
  },
  generatePro(input: ProGenerateInput) {
    return api.post<GenerateResponse>("generate/pro", input);
  },
  getStatus(recordId: string, signal?: AbortSignal) {
    return api.get<GenerationState>(`generate/status/${recordId}`, { signal });
  },
};
