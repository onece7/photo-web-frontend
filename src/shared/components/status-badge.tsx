import { AlertCircle, CircleCheck, Clock3, LoaderCircle } from "lucide-react";
import type { GenerationStatus } from "../api/types";
import { Badge } from "./ui/badge";

const statusMeta = {
  pending: { label: "排队中", tone: "neutral" as const, icon: Clock3 },
  processing: {
    label: "生成中",
    tone: "warning" as const,
    icon: LoaderCircle,
  },
  completed: {
    label: "已完成",
    tone: "success" as const,
    icon: CircleCheck,
  },
  failed: { label: "生成失败", tone: "danger" as const, icon: AlertCircle },
};

export function StatusBadge({ status }: { status: GenerationStatus }) {
  const meta = statusMeta[status] || statusMeta.pending;
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone}>
      <Icon
        className={
          status === "processing" ? "h-3 w-3 animate-spin" : "h-3 w-3"
        }
        aria-hidden="true"
      />
      {meta.label}
    </Badge>
  );
}
