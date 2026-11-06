import {
  AlertCircle,
  Copy,
  Download,
  Expand,
  ImageIcon,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Square,
  WandSparkles,
} from "lucide-react";
import { useEffect, useRef, useState, type PropsWithChildren, type Ref } from "react";
import { toast } from "sonner";
import { getErrorMessage, resolveImageUrl } from "../../../shared/api/client";
import type { GenerationState } from "../../../shared/api/types";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import {
  copyText,
  formatDuration,
  formatElapsed,
  truncate,
} from "../../../shared/lib/utils";

interface ResultCanvasProps {
  recordId: string | null;
  state?: GenerationState;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  timedOut: boolean;
  startTime?: number;
  fallbackPrompt?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
  onStop: () => void;
  onRetry: () => void;
  onRegenerate: () => void;
}

export function ResultCanvas({
  recordId,
  state,
  isLoading,
  isFetching,
  error,
  timedOut,
  startTime,
  fallbackPrompt,
  fallbackWidth = 512,
  fallbackHeight = 512,
  onStop,
  onRetry,
  onRegenerate,
}: ResultCanvasProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const elapsed = useElapsed(startTime || Date.now(), Boolean(recordId));
  const imageUrl = resolveImageUrl(state?.image_url);
  const status = state?.status;
  const prompt = state?.prompt || fallbackPrompt || "";
  const width = state?.width || fallbackWidth;
  const height = state?.height || fallbackHeight;

  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  useEffect(() => {
    if (
      status === "completed" &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [status]);

  if (!recordId) {
    return <EmptyCanvas />;
  }

  if (timedOut && status !== "completed" && status !== "failed") {
    return (
      <CanvasShell ref={resultRef}>
        <FailureState
          title="等待超时"
          message="已持续跟踪 5 分钟，任务可能仍在后端运行。你可以返回历史记录稍后查看。"
          onRetry={onRetry}
          onStop={onStop}
        />
      </CanvasShell>
    );
  }

  if (error && !state) {
    return (
      <CanvasShell ref={resultRef}>
        <FailureState
          title="无法获取任务状态"
          message={getErrorMessage(error, "网络连接异常，请稍后重试")}
          onRetry={onRetry}
          onStop={onStop}
        />
      </CanvasShell>
    );
  }

  if (
    isLoading ||
    !status ||
    status === "pending" ||
    status === "processing"
  ) {
    return (
      <CanvasShell ref={resultRef}>
        <GeneratingState
          status={status === "processing" ? "processing" : "pending"}
          prompt={prompt}
          elapsed={elapsed}
          width={width}
          height={height}
          refreshing={isFetching}
          onStop={onStop}
        />
      </CanvasShell>
    );
  }

  if (status === "failed") {
    return (
      <CanvasShell ref={resultRef}>
        <FailureState
          title="生成失败"
          message={state.error_message || "后端未能完成本次生成任务"}
          onRetry={onRetry}
          onStop={onStop}
        />
      </CanvasShell>
    );
  }

  if (!imageUrl) {
    return (
      <CanvasShell ref={resultRef}>
        <FailureState
          title="图片地址无效"
          message="任务已完成，但后端没有返回可访问的图片。"
          onRetry={onRetry}
          onStop={onStop}
        />
      </CanvasShell>
    );
  }

  const downloadName = `photo-web-${recordId.slice(0, 8)}.png`;

  return (
    <CanvasShell ref={resultRef}>
      <div className="flex w-full max-w-[1100px] flex-col items-center">
        <div className="mb-4 flex w-full items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              创作完成
            </p>
            <p className="mt-1 truncate text-xs text-muted" title={prompt}>
              {truncate(prompt, 80)}
            </p>
          </div>
          {state.duration_ms ? (
            <span className="shrink-0 font-mono text-[11px] text-muted">
              {formatDuration(state.duration_ms)}
            </span>
          ) : null}
        </div>

        <div
          className="group relative w-full overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/10"
          style={{
            aspectRatio: `${width} / ${height}`,
            maxHeight: "calc(100dvh - 230px)",
          }}
        >
          {!imageLoaded ? (
            <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,hsl(var(--panel))_25%,hsl(var(--line)/.5)_50%,hsl(var(--panel))_75%)] bg-[length:200%_100%]" />
          ) : null}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 h-full w-full cursor-zoom-in focus-visible:ring-inset"
            aria-label="查看大图"
          >
            <img
              src={imageUrl}
              alt={prompt ? `AI 生成图片：${prompt}` : "AI 生成图片"}
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-contain transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-within:opacity-100">
              <Expand className="h-4 w-4" />
            </span>
          </button>
        </div>

        <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
            <span>
              {width} × {height}
            </span>
            {state.seed !== undefined ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Seed {state.seed}</span>
              </>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await copyText(prompt);
                  toast.success("提示词已复制");
                } catch {
                  toast.error("复制失败，请手动选择文本");
                }
              }}
            >
              <Copy />
              复制提示词
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRegenerate}
            >
              <RotateCcw />
              再次生成
            </Button>
            <Button asChild variant="secondary" size="sm">
              <a
                href={imageUrl}
                download={downloadName}
                target="_blank"
                rel="noreferrer"
              >
                <Download />
                下载图片
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-h-[92dvh] max-w-[96vw] overflow-auto bg-[#0b0c0e] p-3 sm:p-4">
          <DialogTitle className="sr-only">查看生成图片</DialogTitle>
          <DialogDescription className="sr-only">
            {prompt}
          </DialogDescription>
          <img
            src={imageUrl}
            alt={prompt ? `AI 生成图片：${prompt}` : "AI 生成图片"}
            className="mx-auto max-h-[82dvh] w-auto max-w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </CanvasShell>
  );
}

const CanvasShell = function CanvasShell({
  children,
  ref,
}: PropsWithChildren<{
  ref?: Ref<HTMLDivElement>;
}>) {
  return (
    <section
      ref={ref}
      className="workspace flex min-h-[540px] min-w-0 items-start justify-center overflow-y-auto bg-canvas px-4 py-8 sm:px-8 md:min-h-[calc(100dvh-64px)] md:items-center md:p-8"
      aria-live="polite"
    >
      {children}
    </section>
  );
};

function EmptyCanvas() {
  return (
    <CanvasShell>
      <div className="max-w-xl text-center">
        <div className="relative mx-auto mb-8 grid h-24 w-24 place-items-center rounded-[2rem] border border-line bg-panel shadow-2xl">
          <div className="absolute inset-3 rounded-2xl border border-dashed border-line" />
          <WandSparkles className="h-8 w-8 text-brand" />
        </div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-brand">
          Your canvas is ready
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          用一句话，开始一张新画面
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
          在左侧描述你想象中的场景。选择快捷模式快速开始，或使用专业模式精细控制尺寸、采样与种子。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-line bg-panel px-3 py-1.5">
            保持原始比例
          </span>
          <span className="rounded-full border border-line bg-panel px-3 py-1.5">
            支持键盘操作
          </span>
          <span className="rounded-full border border-line bg-panel px-3 py-1.5">
            自动恢复任务
          </span>
        </div>
      </div>
    </CanvasShell>
  );
}

function GeneratingState({
  status,
  prompt,
  elapsed,
  width,
  height,
  refreshing,
  onStop,
}: {
  status: "pending" | "processing";
  prompt: string;
  elapsed: number;
  width: number;
  height: number;
  refreshing: boolean;
  onStop: () => void;
}) {
  return (
    <div className="w-full max-w-[880px]" role="status">
      <div className="mx-auto mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">
            {status === "pending" ? "任务排队中" : "正在生成图片"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {status === "pending"
              ? "生成服务正在分配资源，请稍候"
              : "正在绘制细节，完成后会自动展示"}
          </p>
        </div>
        <span className="font-mono text-xs text-muted">
          {formatElapsed(elapsed)}
        </span>
      </div>

      <div
        className="relative mx-auto w-full max-w-[680px] overflow-hidden rounded-xl border border-line bg-black/20"
        style={{ aspectRatio: `${width} / ${height}`, maxHeight: "56dvh" }}
      >
        <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,hsl(var(--panel))_25%,hsl(var(--line)/.7)_50%,hsl(var(--panel))_75%)] bg-[length:200%_100%]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-canvas/80 backdrop-blur">
            <LoaderCircle className="h-6 w-6 animate-spin text-brand" />
          </div>
          <p className="mt-5 max-w-md text-balance text-sm leading-6 text-ink">
            {prompt || "正在读取任务提示词…"}
          </p>
          <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-line">
            <div className="h-full w-1/2 animate-shimmer rounded-full bg-brand bg-[length:200%_100%]" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {refreshing ? "正在检查任务状态…" : "约每 2 秒自动检查一次"}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onStop}>
          <Square />
          停止跟踪
        </Button>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-muted/80">
        停止跟踪只会关闭当前页面的状态轮询，不会取消后端生成任务。
      </p>
    </div>
  );
}

function FailureState({
  title,
  message,
  onRetry,
  onStop,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  onStop: () => void;
}) {
  return (
    <div className="max-w-lg text-center" role="alert">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-danger/25 bg-danger/10 text-danger">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={onRetry}>
          <RotateCcw />
          返回参数
        </Button>
        <Button type="button" variant="ghost" onClick={onStop}>
          <Square />
          返回初始画布
        </Button>
      </div>
    </div>
  );
}

function useElapsed(startTime: number, enabled: boolean): number {
  const [now, setNow] = useState(Date.now());
  const startRef = useRef(startTime);

  useEffect(() => {
    startRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return Math.max(0, now - startRef.current);
}
