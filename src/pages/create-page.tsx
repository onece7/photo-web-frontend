import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useHistoryDetail } from "../features/history/hooks";
import { generationApi } from "../features/generation/api";
import { GenerationPanel } from "../features/generation/components/generation-panel";
import {
  MobileRecentTasks,
  RecentTasks,
  RecentTasksDrawer,
} from "../features/generation/components/recent-tasks";
import { ResultCanvas } from "../features/generation/components/result-canvas";
import {
  generationKeys,
  useGenerationStatus,
  useStyles,
} from "../features/generation/hooks";
import { useWorkspaceStore } from "../features/generation/store";
import { getErrorMessage } from "../shared/api/client";
import type {
  GenerateResponse,
  ProGenerateInput,
  SimpleGenerateInput,
} from "../shared/api/types";
import { AppHeader } from "../shared/components/app-header";
import { historyKeys } from "../features/history/hooks";

export function CreatePage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const rerunId = searchParams.get("rerun") || undefined;
  const { data: rerun, isLoading: rerunLoading } =
    useHistoryDetail(rerunId);
  const stylesQuery = useStyles();
  const mode = useWorkspaceStore((state) => state.mode);
  const setMode = useWorkspaceStore((state) => state.setMode);
  const activeRecordId = useWorkspaceStore(
    (state) => state.activeRecordId,
  );
  const setActiveRecordId = useWorkspaceStore(
    (state) => state.setActiveRecordId,
  );
  const recentTasks = useWorkspaceStore((state) => state.recentTasks);
  const addRecentTask = useWorkspaceStore((state) => state.addRecentTask);
  const updateRecentTask = useWorkspaceStore(
    (state) => state.updateRecentTask,
  );
  const isRecentDrawerOpen = useWorkspaceStore(
    (state) => state.isRecentDrawerOpen,
  );
  const setRecentDrawerOpen = useWorkspaceStore(
    (state) => state.setRecentDrawerOpen,
  );
  const lastRerunRef = useRef<string | null>(null);

  const activeTask = useMemo(
    () =>
      recentTasks.find((task) => task.recordId === activeRecordId) || null,
    [activeRecordId, recentTasks],
  );
  const statusQuery = useGenerationStatus(
    activeRecordId,
    activeTask?.createdAt,
  );
  const lastObservedStatus = useRef<string | null>(null);

  const addGeneratedTask = (
    response: GenerateResponse,
    input: SimpleGenerateInput | ProGenerateInput,
    taskMode: "simple" | "pro",
    styleName?: string,
  ) => {
    const width = "width" in input ? input.width : 512;
    const height = "height" in input ? input.height : 512;
    const task = {
      recordId: response.record_id,
      prompt: input.prompt,
      status: response.status,
      mode: taskMode,
      width,
      height,
      createdAt: new Date().toISOString(),
      styleName,
    };
    addRecentTask(task);
    lastObservedStatus.current = response.status;
    queryClient.setQueryData(generationKeys.status(response.record_id), {
      record_id: response.record_id,
      status: response.status,
      prompt: input.prompt,
      width,
      height,
      negative_prompt:
        "negative_prompt" in input ? input.negative_prompt : "",
      cfg_scale: "cfg_scale" in input ? input.cfg_scale : 7,
      steps: "steps" in input ? input.steps : 20,
      sampler: "sampler" in input ? input.sampler : "Euler a",
      seed: "seed" in input ? input.seed : -1,
    });
  };

  const simpleMutation = useMutation({
    mutationFn: generationApi.generateSimple,
    onSuccess: (response, values) => {
      const styleName = stylesQuery.data?.find(
        (style) => style.id === values.style_id,
      )?.display_name;
      addGeneratedTask(response, values, "simple", styleName);
      toast.success("任务已提交，正在排队生成");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "提交生成任务失败"));
    },
  });

  const proMutation = useMutation({
    mutationFn: generationApi.generatePro,
    onSuccess: (response, values) => {
      addGeneratedTask(response, values, "pro");
      toast.success("任务已提交，正在排队生成");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "提交生成任务失败"));
    },
  });

  const generationPending =
    simpleMutation.isPending || proMutation.isPending;

  useEffect(() => {
    if (!rerun || lastRerunRef.current === rerun.id) {
      return;
    }
    lastRerunRef.current = rerun.id;
    setMode(rerun.mode);
    const existing = recentTasks.find((task) => task.recordId === rerun.id);
    if (!existing) {
      addRecentTask({
        recordId: rerun.id,
        prompt: rerun.prompt,
        status: rerun.status,
        mode: rerun.mode,
        width: rerun.width,
        height: rerun.height,
        createdAt: rerun.created_at,
        styleName: rerun.style?.display_name,
        imageUrl: rerun.image_url,
      });
    } else {
      setActiveRecordId(rerun.id);
    }
    toast.info("原图参数已载入，可调整后再生成");
  }, [
    addRecentTask,
    recentTasks,
    rerun,
    setActiveRecordId,
    setMode,
  ]);

  useEffect(() => {
    const state = statusQuery.data;
    if (!activeRecordId || !state) {
      return;
    }
    const currentTask = useWorkspaceStore
      .getState()
      .recentTasks.find((task) => task.recordId === activeRecordId);
    const nextStatus = state.status;
    const nextPrompt = state.prompt || currentTask?.prompt;
    const nextWidth = state.width || currentTask?.width;
    const nextHeight = state.height || currentTask?.height;
    const changed =
      currentTask &&
      (currentTask.status !== nextStatus ||
        currentTask.prompt !== nextPrompt ||
        currentTask.width !== nextWidth ||
        currentTask.height !== nextHeight ||
        currentTask.imageUrl !== state.image_url);

    if (changed) {
      updateRecentTask(activeRecordId, {
        status: nextStatus,
        prompt: nextPrompt,
        width: nextWidth,
        height: nextHeight,
        imageUrl: state.image_url,
      });
    }

    if (
      state.status !== lastObservedStatus.current &&
      state.status === "completed"
    ) {
      void queryClient.invalidateQueries({ queryKey: historyKeys.all });
      toast.success("图片生成完成");
    }
    if (
      state.status !== lastObservedStatus.current &&
      state.status === "failed"
    ) {
      toast.error(state.error_message || "图片生成失败");
    }
    lastObservedStatus.current = state.status;
  }, [
    activeRecordId,
    queryClient,
    statusQuery.data,
    updateRecentTask,
  ]);

  const focusParameters = () => {
    const id = mode === "simple" ? "simple-prompt" : "pro-prompt";
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => element?.focus(), 250);
  };

  return (
    <div className="workspace min-h-dvh overflow-x-hidden bg-canvas text-ink md:h-dvh md:overflow-hidden">
      <AppHeader
        active="create"
        onOpenRecent={() => setRecentDrawerOpen(true)}
      />
      <main className="grid min-h-[calc(100dvh-64px)] bg-canvas pb-24 md:grid-cols-[320px_minmax(0,1fr)] md:overflow-hidden md:pb-0 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_240px] min-[1440px]:grid-cols-[360px_minmax(0,1fr)_280px]">
        <GenerationPanel
          mode={mode}
          onModeChange={setMode}
          styles={stylesQuery.data || []}
          stylesLoading={stylesQuery.isLoading}
          stylesError={
            stylesQuery.error
              ? getErrorMessage(stylesQuery.error, "请稍后重试")
              : undefined
          }
          simplePending={simpleMutation.isPending || generationPending}
          proPending={proMutation.isPending || generationPending}
          rerun={rerun}
          onSimpleGenerate={(input) => {
            if (!generationPending) {
              simpleMutation.mutate(input);
            }
          }}
          onProGenerate={(input) => {
            if (!generationPending) {
              proMutation.mutate(input);
            }
          }}
        />

        <ResultCanvas
          recordId={activeRecordId}
          state={statusQuery.data}
          isLoading={
            Boolean(activeRecordId) &&
            !statusQuery.data &&
            !statusQuery.error &&
            (!statusQuery.isFetched || rerunLoading)
          }
          isFetching={statusQuery.isFetching}
          error={statusQuery.error}
          timedOut={statusQuery.timedOut}
          startTime={statusQuery.startTime}
          fallbackPrompt={activeTask?.prompt}
          fallbackWidth={activeTask?.width}
          fallbackHeight={activeTask?.height}
          onStop={() => setActiveRecordId(null)}
          onRetry={focusParameters}
          onRegenerate={focusParameters}
        />

        <MobileRecentTasks
          tasks={recentTasks}
          activeId={activeRecordId}
          onSelect={setActiveRecordId}
        />

        <RecentTasks
          tasks={recentTasks}
          activeId={activeRecordId}
          onSelect={setActiveRecordId}
        />
      </main>

      <RecentTasksDrawer
        open={isRecentDrawerOpen}
        onOpenChange={setRecentDrawerOpen}
        tasks={recentTasks}
        activeId={activeRecordId}
        onSelect={setActiveRecordId}
      />
    </div>
  );
}
