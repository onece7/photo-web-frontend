import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { historyApi } from "./api";

export const historyKeys = {
  all: ["history"] as const,
  list: (page: number, pageSize: number) =>
    [...historyKeys.all, "list", page, pageSize] as const,
  detail: (id: string) => [...historyKeys.all, "detail", id] as const,
};

export function useHistoryList(page: number, pageSize: number) {
  return useQuery({
    queryKey: historyKeys.list(page, pageSize),
    queryFn: ({ signal }) => historyApi.list(page, pageSize, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 10_000,
  });
}

export function useHistoryDetail(id?: string) {
  return useQuery({
    queryKey: historyKeys.detail(id || "none"),
    queryFn: ({ signal }) => historyApi.detail(id!, signal),
    enabled: Boolean(id),
  });
}

export function useDeleteHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: historyApi.delete,
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: historyKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}
