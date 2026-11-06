import {
  Download,
  ImageOff,
  MoreHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../../../shared/api/client";
import type { GenerationRecord } from "../../../shared/api/types";
import { StatusBadge } from "../../../shared/components/status-badge";
import { Button } from "../../../shared/components/ui/button";
import { formatDate, truncate } from "../../../shared/lib/utils";

export function HistoryCard({
  record,
  onDelete,
}: {
  record: GenerationRecord;
  onDelete: (record: GenerationRecord) => void;
}) {
  const imageUrl = resolveImageUrl(record.image_url || record.thumbnail_url);
  const styleName =
    record.style?.display_name ||
    (record.mode === "pro" ? "专业模式" : "快捷创作");
  const detailUrl = `/history/${record.id}`;
  const downloadName = `photo-web-${record.id.slice(0, 8)}.png`;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-panel">
        <Link
          to={detailUrl}
          className="absolute inset-0 z-10 focus-visible:ring-inset"
          aria-label={`查看作品：${truncate(record.prompt, 40)}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={record.prompt ? `AI 生成图片：${record.prompt}` : "AI 生成图片"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
            />
          ) : (
            <span className="flex h-full flex-col items-center justify-center p-6 text-center text-muted">
              {record.status === "failed" ? (
                <ImageOff className="h-7 w-7" />
              ) : (
                <Sparkles className="h-7 w-7" />
              )}
              <span className="mt-2 text-xs">
                {record.status === "failed" ? "生成失败" : "暂无图片"}
              </span>
            </span>
          )}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 z-20">
          <StatusBadge status={record.status} />
        </div>
        <div className="absolute inset-x-3 bottom-3 z-20 flex justify-end gap-1.5 opacity-100 transition md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          {imageUrl ? (
            <Button
              asChild
              variant="secondary"
              size="icon-sm"
              className="bg-black/60 text-white backdrop-blur hover:bg-black/75"
            >
              <a
                href={imageUrl}
                download={downloadName}
                target="_blank"
                rel="noreferrer"
                aria-label="下载图片"
              >
                <Download />
              </a>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="bg-black/60 text-white backdrop-blur hover:bg-danger"
            onClick={() => onDelete(record)}
            aria-label="删除作品"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="px-0.5 pt-3">
        <Link
          to={detailUrl}
          className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-ink transition hover:text-brand"
        >
          {record.prompt || "未填写提示词"}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
          <span className="truncate">
            {styleName} · {record.width}×{record.height}
          </span>
          <span className="shrink-0">
            {formatDate(record.created_at, {
              year: undefined,
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        </div>
      </div>
    </article>
  );
}

export function HistoryCardSkeleton() {
  return (
    <div>
      <div className="aspect-square animate-pulse rounded-2xl bg-panel" />
      <div className="mt-3 h-4 w-11/12 animate-pulse rounded bg-panel" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-panel" />
    </div>
  );
}

export function MoreIcon() {
  return <MoreHorizontal className="h-4 w-4" />;
}
