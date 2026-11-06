import { AlertCircle, Image, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  HistoryCard,
  HistoryCardSkeleton,
} from "../features/history/components/history-card";
import { Pagination } from "../features/history/components/pagination";
import {
  useDeleteHistory,
  useHistoryList,
} from "../features/history/hooks";
import { getErrorMessage } from "../shared/api/client";
import type { GenerationRecord } from "../shared/api/types";
import { AppHeader } from "../shared/components/app-header";
import { Spinner } from "../shared/components/spinner";
import { Button } from "../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shared/components/ui/dialog";
import { usePageSize } from "../shared/hooks/use-page-size";

export function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = usePageSize();
  const rawPage = Number(searchParams.get("page") || 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const historyQuery = useHistoryList(page, pageSize);
  const deleteMutation = useDeleteHistory();
  const [pendingDelete, setPendingDelete] =
    useState<GenerationRecord | null>(null);

  useEffect(() => {
    if (
      historyQuery.data &&
      historyQuery.data.total_pages > 0 &&
      page > historyQuery.data.total_pages
    ) {
      setSearchParams(
        { page: String(historyQuery.data.total_pages) },
        { replace: true },
      );
    }
  }, [historyQuery.data, page, setSearchParams]);

  const changePage = (nextPage: number) => {
    setSearchParams(nextPage <= 1 ? {} : { page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = () => {
    if (!pendingDelete) {
      return;
    }
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success("作品已删除");
        setPendingDelete(null);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "删除失败，请稍后重试"));
      },
    });
  };

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <AppHeader active="history" />
      <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-10 sm:px-7 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Your Gallery
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                我的作品
              </h1>
              {historyQuery.data ? (
                <span className="text-sm text-muted">
                  共 {historyQuery.data.total} 张
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted">
              查看生成记录、完整参数，或带回参数继续创作。
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/create">
              <Plus />
              创作新图片
            </Link>
          </Button>
        </div>

        {historyQuery.isLoading ? (
          <div className="mt-9 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: pageSize }).map((_, index) => (
              <HistoryCardSkeleton key={index} />
            ))}
          </div>
        ) : historyQuery.error ? (
          <div className="mt-9 rounded-2xl border border-danger/20 bg-danger/5 px-6 py-16 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-danger" />
            <h2 className="mt-4 text-lg font-semibold">历史记录加载失败</h2>
            <p className="mt-2 text-sm text-muted">
              {getErrorMessage(historyQuery.error, "请检查网络后重试")}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => void historyQuery.refetch()}
            >
              <RefreshCw />
              重新加载
            </Button>
          </div>
        ) : !historyQuery.data?.records.length ? (
          <div className="mt-9 rounded-2xl border border-dashed border-line bg-surface px-6 py-24 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-panel text-muted">
              <Image className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">还没有作品</h2>
            <p className="mt-2 text-sm text-muted">
              创建第一张图片，完成的生成记录会出现在这里。
            </p>
            <Button asChild className="mt-6">
              <Link to="/create">
                <Plus />
                开始创作
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div
              className={`mt-9 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                historyQuery.isFetching ? "opacity-70" : ""
              }`}
            >
              {historyQuery.data.records.map((record) => (
                <HistoryCard
                  key={record.id}
                  record={record}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
            <Pagination
              page={historyQuery.data.page}
              totalPages={historyQuery.data.total_pages}
              onPageChange={changePage}
            />
          </>
        )}
      </main>

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除这张作品？</DialogTitle>
            <DialogDescription>
              删除后无法恢复。图片文件和历史参数都会从你的记录中移除。
            </DialogDescription>
          </DialogHeader>
          {pendingDelete ? (
            <p className="line-clamp-2 rounded-lg bg-panel p-3 text-sm text-muted">
              {pendingDelete.prompt}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingDelete(null)}
              disabled={deleteMutation.isPending}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Spinner label="正在删除" /> : null}
              {deleteMutation.isPending ? "正在删除…" : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
