import { Aperture } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/create"
      className={cn(
        "inline-flex items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
      aria-label="Photo Web 创作工作台"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
        <Aperture className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </span>
      <span className="text-[15px]">PHOTO WEB</span>
    </Link>
  );
}
