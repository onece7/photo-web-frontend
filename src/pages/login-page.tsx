import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../features/auth/api";
import { AuthShell } from "../features/auth/components/auth-shell";
import {
  loginSchema,
  type LoginValues,
} from "../features/auth/schemas";
import { useAuthStore } from "../features/auth/store";
import { getErrorMessage } from "../shared/api/client";
import { consumeReturnTo } from "../shared/api/token-store";
import { Spinner } from "../shared/components/spinner";
import { Button } from "../shared/components/ui/button";
import { Input } from "../shared/components/ui/input";
import { Label } from "../shared/components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const tokens = await authApi.login(values);
      resetField("password");
      setSession(tokens, values.username.trim());
      const returnTo = consumeReturnTo();
      toast.success("欢迎回来");
      navigate(returnTo || "/create", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, "登录失败，请检查用户名和密码");
      setError("root", { message });
    }
  });

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="继续你的创作"
      description="登录后继续使用生成工作台，并查看你的历史作品。"
    >
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        {errors.root?.message ? (
          <div
            role="alert"
            className="rounded-lg border border-danger/25 bg-danger/5 px-3 py-2.5 text-sm text-danger"
          >
            {errors.root.message}
          </div>
        ) : null}

        <Field
          label="用户名"
          htmlFor="username"
          error={errors.username?.message}
        >
          <Input
            id="username"
            autoComplete="username"
            placeholder="输入你的用户名"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "username-error" : undefined}
            {...register("username")}
          />
        </Field>

        <Field
          label="密码"
          htmlFor="password"
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="输入密码"
              className="pr-11"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "password-error" : undefined
              }
              {...register("password")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted transition hover:text-ink"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner label="正在登录" /> : <LogIn />}
          {isSubmitting ? "正在登录…" : "进入创作"}
        </Button>

        <p className="text-center text-sm text-muted">
          还没有账号？
          <Link
            to="/register"
            className="ml-1 font-medium text-ink underline decoration-line underline-offset-4 transition hover:text-brand"
          >
            创建账号
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: React.PropsWithChildren<{
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
}>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
