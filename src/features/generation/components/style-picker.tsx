import { ImageIcon } from "lucide-react";
import type { ImageStyle } from "../../../shared/api/types";
import { resolveImageUrl } from "../../../shared/api/client";
import { cn } from "../../../shared/lib/utils";

const artStyles: Record<string, string> = {
  anime:
    "from-[#283558] via-[#825da4] to-[#e4a4ba] after:bg-[radial-gradient(circle_at_30%_35%,#ffe2be_0_7%,transparent_8%),radial-gradient(circle_at_65%_55%,#9ddcf4_0_9%,transparent_10%)]",
  realistic:
    "from-[#30383d] via-[#8c8174] to-[#d8c5a3] after:bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,.45)_31%,transparent_55%)]",
  watercolor:
    "from-[#b9e3e8] via-[#7fb5c5] to-[#ddbb9f] after:bg-[radial-gradient(ellipse_at_35%_30%,rgba(255,255,255,.8),transparent_25%),radial-gradient(ellipse_at_70%_65%,rgba(50,95,125,.5),transparent_30%)]",
  oil_painting:
    "from-[#3e2520] via-[#a54d2e] to-[#e0ad60] after:bg-[repeating-linear-gradient(115deg,transparent_0_8px,rgba(255,255,255,.08)_9px_11px)]",
  pixel_art:
    "from-[#172f2c] via-[#377b61] to-[#a8c969] after:bg-[linear-gradient(90deg,transparent_48%,rgba(0,0,0,.2)_50%,transparent_52%),linear-gradient(transparent_48%,rgba(0,0,0,.2)_50%,transparent_52%)] after:bg-[length:12px_12px]",
  sketch:
    "from-[#e4dfd6] via-[#aaa59b] to-[#55514b] after:bg-[repeating-linear-gradient(70deg,transparent_0_5px,rgba(20,20,20,.14)_6px_7px)]",
};

export function StylePicker({
  styles,
  selectedId,
  onSelect,
  loading,
  error,
}: {
  styles: ImageStyle[];
  selectedId?: string;
  onSelect: (id: string) => void;
  loading: boolean;
  error?: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2" aria-label="正在加载风格">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[92px] animate-pulse rounded-xl bg-panel"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
        风格加载失败：{error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {styles.map((style) => {
        const preview = resolveImageUrl(style.preview_url);
        const selected = selectedId === style.id;
        return (
          <button
            key={style.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(style.id)}
            className={cn(
              "group overflow-hidden rounded-xl border bg-panel text-left transition",
              selected
                ? "border-brand ring-2 ring-brand/20"
                : "border-line hover:border-muted/60",
            )}
          >
            <span
              className={cn(
                "relative block h-14 overflow-hidden bg-gradient-to-br after:absolute after:inset-0 after:content-['']",
                artStyles[style.name] || artStyles.realistic,
              )}
            >
              {preview ? (
                <img
                  src={preview}
                  alt=""
                  loading="lazy"
                  className="relative z-10 h-full w-full object-cover"
                />
              ) : (
                <ImageIcon
                  className="absolute right-2 top-2 z-10 h-3.5 w-3.5 text-white/65"
                  aria-hidden="true"
                />
              )}
            </span>
            <span className="block p-2">
              <span className="block text-xs font-medium text-ink">
                {style.display_name}
              </span>
              <span className="mt-0.5 line-clamp-1 block text-[11px] leading-4 text-muted">
                {style.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
