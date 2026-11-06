import { Clock3, LogOut, Menu, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../../features/auth/api";
import { useAuthStore } from "../../features/auth/store";
import { getRefreshToken } from "../api/token-store";
import { cn } from "../lib/utils";
import { Logo } from "./logo";
import { Button } from "./ui/button";

interface AppHeaderProps {
  active?: "create" | "history" | "detail";
  onOpenRecent?: () => void;
}

export function AppHeader({ active, onOpenRecent }: AppHeaderProps) {
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username);
  const clearSession = useAuthStore((state) => state.clearSession);
  const logout = useMutation({
    mutationFn: () => authApi.logout(getRefreshToken()),
    onSettled: () => {
      clearSession();
      navigate("/login", { replace: true });
    },
    onError: () => {
      toast.info("本地登录信息已清除");
    },
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-line bg-canvas/95 px-4 backdrop-blur sm:px-6">
      <Logo />
      <nav
        aria-label="主导航"
        className="ml-8 flex h-full items-center gap-1 sm:ml-12"
      >
        <NavLink
          href="/create"
          active={active === "create" || active === "detail"}
        >
          <Sparkles className="h-4 w-4" />
          创作
        </NavLink>
        <NavLink href="/history" active={active === "history"}>
          <Clock3 className="h-4 w-4" />
          历史
        </NavLink>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {onOpenRecent ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="xl:hidden"
            onClick={onOpenRecent}
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">最近任务</span>
            <span className="sr-only sm:hidden">打开最近任务</span>
          </Button>
        ) : null}
        <details className="group relative">
          <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg px-2 text-sm text-muted transition hover:bg-panel hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-panel text-xs font-semibold uppercase text-ink">
              {(username || "U").slice(0, 1)}
            </span>
            <span className="hidden max-w-32 truncate sm:block">
              {username || "我的账户"}
            </span>
          </summary>
          <div className="absolute right-0 top-[calc(100%+8px)] w-44 rounded-xl border border-line bg-surface p-1.5 shadow-panel">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted transition hover:bg-panel hover:text-ink"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logout.isPending ? "正在退出…" : "退出登录"}
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
        active
          ? "bg-panel font-medium text-ink"
          : "text-muted hover:bg-panel/60 hover:text-ink",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </a>
  );
}
