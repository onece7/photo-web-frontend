import * as React from "react";
import { cn } from "../../lib/utils";

type BadgeTone = "neutral" | "success" | "danger" | "warning" | "brand";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-panel text-muted ring-line",
  success: "bg-success/10 text-success ring-success/20",
  danger: "bg-danger/10 text-danger ring-danger/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  brand: "bg-brand-soft text-brand ring-brand/20",
};

export function Badge({
  className,
  tone = "neutral",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
