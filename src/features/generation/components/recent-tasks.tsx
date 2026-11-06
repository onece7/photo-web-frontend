import { Clock3, Images, Sparkles } from "lucide-react";
import { resolveImageUrl } from "../../../shared/api/client";
import { StatusBadge } from "../../../shared/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { cn, formatDate, truncate } from "../../../shared/lib/utils";
import type { RecentTask } from "../store";

export function RecentTasks({
  tasks,
  activeId,
  onSelect,
  className,
}: {
  tasks: RecentTask[];
  activeId: string | null;
  onSelect: (recordId: string) => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "hidden min-h-0 overflow-y-auto border-l border-line bg-surface p-3 xl:block",
        className,
      )}
      aria-label="最近任务"
    >
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-semibold text-ink">最近任务</h2>
          <p className="mt-0.5 text-[11px] text-muted">当前会话</p>
        </div>
        <Clock3 className="h-4 w-4 text-muted" />
      </div>
      <RecentTaskList
        tasks={tasks}
        activeId={activeId}
        onSelect={onSelect}
      />
    </aside>
  );
}

export function RecentTasksDrawer({
  open,
  onOpenChange,
  tasks,
  activeId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: RecentTask[];
  activeId: string | null;
  onSelect: (recordId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 h-dvh w-[min(88vw,360px)] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-r-0 p-4">
        <div className="pr-8">
          <DialogTitle>最近任务</DialogTitle>
          <DialogDescription>选择任务切换中间画布</DialogDescription>
        </div>
        <RecentTaskList
          tasks={tasks}
          activeId={activeId}
          onSelect={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function MobileRecentTasks({
  tasks,
  activeId,
  onSelect,
}: {
  tasks: RecentTask[];
  activeId: string | null;
  onSelect: (recordId: string) => void;
}) {
  return (
    <section className="border-t border-line bg-surface p-4 md:hidden">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">最近任务</h2>
        <span className="text-[11px] text-muted">当前会话</span>
      </div>
      {tasks.length ? (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tasks.map((task) => {
            const image = resolveImageUrl(task.imageUrl);
            return (
              <button
                type="button"
                key={task.recordId}
                onClick={() => onSelect(task.recordId)}
                className={cn(
                  "w-32 shrink-0 overflow-hidden rounded-xl border text-left transition",
                  activeId === task.recordId
                    ? "border-brand bg-brand-soft/50"
                    : "border-line bg-panel/40",
                )}
              >
                <span className="grid h-20 w-full place-items-center overflow-hidden bg-panel">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Sparkles className="h-4 w-4 text-muted" />
                  )}
                </span>
                <span className="block p-2">
                  <span className="line-clamp-2 min-h-8 text-[11px] leading-4 text-ink">
                    {truncate(task.prompt, 30)}
                  </span>
                  <span className="mt-1.5 block text-[10px] text-muted">
                    {task.status === "completed"
                      ? "已完成"
                      : task.status === "failed"
                        ? "失败"
                        : "生成中"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-xs text-muted">
          提交任务后会显示在这里
        </p>
      )}
    </section>
  );
}

function RecentTaskList({
  tasks,
  activeId,
  onSelect,
}: {
  tasks: RecentTask[];
  activeId: string | null;
  onSelect: (recordId: string) => void;
}) {
  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center">
        <Images className="mx-auto h-6 w-6 text-muted" />
        <p className="mt-3 text-xs text-muted">还没有生成任务</p>
        <p className="mt-1 text-[11px] leading-5 text-muted/70">
          提交任务后会显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {tasks.map((task) => {
        const image = resolveImageUrl(task.imageUrl);
        const active = task.recordId === activeId;
        return (
          <button
            type="button"
            key={task.recordId}
            onClick={() => onSelect(task.recordId)}
            className={cn(
              "group flex w-full items-start gap-2.5 rounded-xl border p-2 text-left transition",
              active
                ? "border-brand/40 bg-brand-soft/60"
                : "border-transparent hover:border-line hover:bg-panel/60",
            )}
            aria-current={active ? "true" : undefined}
          >
            <span className="relative grid h-14 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-panel">
              {image ? (
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Sparkles className="h-4 w-4 text-muted" />
              )}
            </span>
            <span className="min-w-0 flex-1 py-0.5">
              <span className="block text-[11px] leading-5 text-ink">
                {truncate(task.prompt, 34)}
              </span>
              <span className="mt-1.5 flex items-center justify-between gap-1">
                <StatusBadge status={task.status} />
                <span className="shrink-0 text-[10px] text-muted">
                  {formatDate(task.createdAt, {
                    year: undefined,
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
