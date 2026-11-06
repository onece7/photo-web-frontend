import {
  AlertCircle,
  ArrowLeft,
  Copy,
  Download,
  ImageOff,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useDeleteHistory,
  useHistoryDetail,
} from "../features/history/hooks";
import {
  getErrorMessage,
  resolveImageUrl,
} from "../shared/api/client";
import { AppHeader } from "../shared/components/app-header";
import { Spinner } from "../shared/components/spinner";
import { StatusBadge } from "../shared/components/status-badge";
import { Button } from "../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shared/components/ui/dialog";
import {
  copyText,
  formatDate,
  formatDuration,
} from "../shared/lib/utils";

export function HistoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detailQuery = useHistoryDetail(id);
  const deleteMutation = useDeleteHistory();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const record = detailQuery.data;
  const imageUrl = resolveImageUrl(record?.image_url);

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-dvh bg-canvas text-ink">
        <AppHeader active="detail" />
        <main className="grid min-h-[calc(100dvh-64px)] place-items-center">
          <div className="text-center text-muted">
            <Spinner className="h-6 w-6" label="正在加载作品" />
            <p className="mt-3 text-sm">正在加载作品详情…</p>
          </div>
        </main>
      </div>
    );
  }

  if (detailQuery.error || !record) {
    return (
      <div className="min-h-dvh bg-canvas text-ink">
        <AppHeader active="detail" />
        <main className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-xl flex-col items-center justify-center px-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-danger/10 text-danger">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold">无法打开这张作品</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {getErrorMessage(
              detailQuery.error,
              "记录不存在、已被删除，或你无权访问",
            )}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/history">
              <ArrowLeft />
              返回历史记录
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const fullParams = [
    `模式：${record.mode === "simple" ? "快捷创作" : "专业模式"}`,
    `提示词：${record.prompt}`,
    `反向提示词：${record.negative_prompt || "无"}`,
    `风格：${record.style?.display_name || "无"}`,
    `尺寸：${record.width}×${record.height}`,
    `Steps：${record.steps}`,
    `CFG Scale：${record.cfg_scale}`,
    `Sampler：${record.sampler}`,
    `Seed：${record.seed}`,
    `生成耗时：${formatDuration(record.duration_ms)}`,
    `创建时间：${formatDate(record.created_at)}`,
  ].join("\n");

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <AppHeader active="detail" />
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/history"
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            返回历史记录
          </Link>
          <StatusBadge status={record.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,.75fr)]">
          <section className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-line bg-[#e8e8e5] p-3 sm:min-h-[560px] sm:p-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={record.prompt ? `AI 生成图片：${record.prompt}` : "AI 生成图片"}
                className="max-h-[calc(100dvh-180px)] w-full object-contain"
              />
            ) : (
              <div className="text-center text-muted">
                <ImageOff className="mx-auto h-8 w-8" />
                <p className="mt-3 text-sm">该记录暂无可用图片</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
              Generation record
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight">
              作品详情
            </h1>
            <p className="mt-2 text-xs text-muted">
              创建于 {formatDate(record.created_at)}
            </p>

            {record.status === "failed" && record.error_message ? (
              <div className="mt-5 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm leading-6 text-danger">
                {record.error_message}
              </div>
            ) : null}

            <div className="mt-6">
              <p className="text-xs font-medium text-muted">完整提示词</p>
              <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-panel p-3 text-sm leading-7 text-ink">
                {record.prompt}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium text-muted">反向提示词</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">
                {record.negative_prompt || "无"}
              </p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5">
              <Param label="模式" value={record.mode === "simple" ? "快捷创作" : "专业模式"} />
              <Param label="风格" value={record.style?.display_name || "无"} />
              <Param label="尺寸" value={`${record.width} × ${record.height}`} mono />
              <Param label="Steps" value={String(record.steps)} mono />
              <Param label="CFG Scale" value={String(record.cfg_scale)} mono />
              <Param label="Sampler" value={record.sampler || "—"} mono />
              <Param label="Seed" value={String(record.seed)} mono />
              <Param label="生成耗时" value={formatDuration(record.duration_ms)} mono />
            </dl>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {imageUrl ? (
                <Button asChild variant="outline">
                  <a
                    href={imageUrl}
                    download={`photo-web-${record.id.slice(0, 8)}.png`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download />
                    下载图片
                  </a>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await copyText(record.prompt);
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
                variant="outline"
                onClick={async () => {
                  try {
                    await copyText(fullParams);
                    toast.success("完整参数已复制");
                  } catch {
                    toast.error("复制失败，请稍后重试");
                  }
                }}
              >
                <Copy />
                复制参数
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/create?rerun=${record.id}`)}
              >
                <RotateCcw />
                再次生成
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full text-danger hover:bg-danger/10 hover:text-danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
              删除此记录
            </Button>
          </section>
        </div>
      </main>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除这张作品？</DialogTitle>
            <DialogDescription>
              图片文件和历史参数将被永久移除，此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(record.id, {
                  onSuccess: () => {
                    toast.success("作品已删除");
                    navigate("/history", { replace: true });
                  },
                  onError: (error) => {
                    toast.error(
                      getErrorMessage(error, "删除失败，请稍后重试"),
                    );
                  },
                })
              }
            >
              {deleteMutation.isPending ? "正在删除…" : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Param({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd
        className={`mt-1 truncate text-sm text-ink ${mono ? "font-mono text-xs" : ""}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
