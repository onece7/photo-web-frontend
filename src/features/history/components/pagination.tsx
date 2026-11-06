import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../shared/lib/utils";
import { Button } from "../../../shared/components/ui/button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPageItems(page, totalPages);
  return (
    <nav
      aria-label="历史记录分页"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="上一页"
      >
        <ChevronLeft />
      </Button>
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="grid h-8 w-8 place-items-center text-xs text-muted"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            type="button"
            key={item}
            onClick={() => onPageChange(item)}
            className={cn(
              "grid h-8 min-w-8 place-items-center rounded-md px-2 text-xs transition",
              item === page
                ? "bg-brand text-white"
                : "text-muted hover:bg-panel hover:text-ink",
            )}
            aria-current={item === page ? "page" : undefined}
            aria-label={`第 ${item} 页`}
          >
            {item}
          </button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="下一页"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}

function getPageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }
  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}
