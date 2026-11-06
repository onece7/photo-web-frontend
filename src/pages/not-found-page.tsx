import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../shared/components/logo";
import { buttonVariants } from "../shared/components/ui/button";
import { cn } from "../shared/lib/utils";

export function NotFoundPage() {
  return (
    <main className="workspace grid min-h-dvh place-items-center bg-canvas p-6 text-ink">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-14 font-mono text-sm tracking-[0.3em] text-brand">
          404 / NOT FOUND
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          这张画布还不存在
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          链接可能已经失效，或者你访问了错误的页面。
        </p>
        <Link
          to="/create"
          className={cn(buttonVariants(), "mt-8 inline-flex")}
        >
          <ArrowLeft />
          返回创作页
        </Link>
      </div>
    </main>
  );
}
