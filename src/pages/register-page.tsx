import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../features/auth/api";
import { AuthShell } from "../features/auth/components/auth-shell";
import {
  registerSchema,
  type RegisterValues,
} from "../features/auth/schemas";
import { useAuthStore } from "../features/auth/store";
import { getErrorMessage } from "../shared/api/client";
import { Spinner } from "../shared/components/spinner";
import { Button } from "../shared/components/ui/button";
import { Input } from "../shared/components/ui/input";
import { Field } from "./login-page";

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const tokens = await authApi.register({
        username: values.username.trim(),
        phone: values.phone,
        password: values.password,
      });
      setSession(tokens, values.username.trim());
      toast.success("账号创建成功，已为你登录");
      navigate("/create", { replace: true });
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error, "注册失败，请稍后重试"),
      });
    }
  });

  return (
    <AuthShell
      eyebrow="Create account"
      title="开始第一次创作"
      description="创建账号，即刻使用快捷模式和完整专业参数生成图片。"
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
          htmlFor="register-username"
          error={errors.username?.message}
        >
          <Input
            id="register-username"
            autoComplete="username"
            placeholder="3～64 个字符"
            aria-invalid={Boolean(errors.username)}
            {...register("username")}
          />
        </Field>

        <Field
          label="手机号"
          htmlFor="phone"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={11}
            placeholder="11 位手机号"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field
          label="密码"
          htmlFor="register-password"
          error={errors.password?.message}
          hint="6～128 个字符"
        >
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="设置登录密码"
              className="pr-11"
              aria-invalid={Boolean(errors.password)}
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

        <Field
          label="确认密码"
          htmlFor="confirm-password"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="再次输入密码"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner label="正在创建账号" /> : <UserPlus />}
          {isSubmitting ? "正在创建…" : "创建账号"}
        </Button>

        <p className="text-center text-sm text-muted">
          已有账号？
          <Link
            to="/login"
            className="ml-1 font-medium text-ink underline decoration-line underline-offset-4 transition hover:text-brand"
          >
            返回登录
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
