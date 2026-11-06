import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { generationApi } from "./api";

export const generationKeys = {
  styles: ["generation", "styles"] as const,
  status: (recordId: string | null) =>
    ["generation", "status", recordId] as const,
};

export function useStyles() {
  return useQuery({
    queryKey: generationKeys.styles,
    queryFn: generationApi.getStyles,
    staleTime: 5 * 60_000,
  });
}

const POLL_INTERVAL = 1_800;
const INITIAL_POLL_DELAY = 1_000;
const POLL_TIMEOUT = 5 * 60_000;

export function useGenerationStatus(
  recordId: string | null,
  startedAt?: string,
) {
  const [initialDelayPassed, setInitialDelayPassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const fallbackStartTime = useMemo(() => Date.now(), [recordId]);
  const startTime = startedAt
    ? new Date(startedAt).getTime()
    : fallbackStartTime;

  useEffect(() => {
    setInitialDelayPassed(false);
    setTimedOut(false);
    if (!recordId) {
      return;
    }

    const elapsed = Math.max(0, Date.now() - startTime);
    const delay = Math.max(0, INITIAL_POLL_DELAY - elapsed);
    const timer = window.setTimeout(
      () => setInitialDelayPassed(true),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [recordId, startTime]);

  const query = useQuery({
    queryKey: generationKeys.status(recordId),
    queryFn: ({ signal }) => generationApi.getStatus(recordId!, signal),
    enabled: Boolean(recordId) && initialDelayPassed && !timedOut,
    retry: 1,
    refetchInterval: (currentQuery) => {
      const status = currentQuery.state.data?.status;
      if (
        status === "completed" ||
        status === "failed" ||
        Date.now() - startTime >= POLL_TIMEOUT
      ) {
        return false;
      }
      if (document.hidden) {
        return 8_000;
      }
      const failures = currentQuery.state.fetchFailureCount;
      return failures
        ? Math.min(2_000 * 2 ** (failures - 1), 8_000)
        : POLL_INTERVAL;
    },
    refetchIntervalInBackground: true,
  });

  const status = query.data?.status;
  useEffect(() => {
    if (
      recordId &&
      status &&
      status !== "completed" &&
      status !== "failed" &&
      Date.now() - startTime >= POLL_TIMEOUT
    ) {
      setTimedOut(true);
    }
  }, [recordId, startTime, status]);

  useEffect(() => {
    if (!recordId || timedOut) {
      return;
    }
    const remaining = Math.max(0, startTime + POLL_TIMEOUT - Date.now());
    const timer = window.setTimeout(() => setTimedOut(true), remaining);
    return () => window.clearTimeout(timer);
  }, [recordId, startTime, timedOut]);

  return { ...query, timedOut, startTime };
}
