import { SlidersHorizontal, WandSparkles } from "lucide-react";
import type { GenerationMode } from "../../../shared/api/types";
import { cn } from "../../../shared/lib/utils";

export function ModeTabs({
  mode,
  onChange,
}: {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 rounded-xl bg-panel p-1"
      role="tablist"
      aria-label="生成模式"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "simple"}
        onClick={() => onChange("simple")}
        className={cn(
          "flex h-9 items-center justify-center gap-2 rounded-lg text-sm transition",
          mode === "simple"
            ? "bg-surface font-medium text-ink shadow-sm"
            : "text-muted hover:text-ink",
        )}
      >
        <WandSparkles className="h-4 w-4" />
        快捷创作
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "pro"}
        onClick={() => onChange("pro")}
        className={cn(
          "flex h-9 items-center justify-center gap-2 rounded-lg text-sm transition",
          mode === "pro"
            ? "bg-surface font-medium text-ink shadow-sm"
            : "text-muted hover:text-ink",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        专业模式
      </button>
    </div>
  );
}
