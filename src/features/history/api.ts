import { api } from "../../shared/api/client";
import type { GenerationRecord, HistoryList } from "../../shared/api/types";

export const historyApi = {
  list(page: number, pageSize: number, signal?: AbortSignal) {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    return api.get<HistoryList>(`history?${params.toString()}`, { signal });
  },
  detail(id: string, signal?: AbortSignal) {
    return api.get<GenerationRecord>(`history/${id}`, { signal });
  },
  delete(id: string) {
    return api.delete<null>(`history/${id}`);
  },
};
