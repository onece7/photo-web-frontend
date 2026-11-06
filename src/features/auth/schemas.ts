import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "用户名至少 3 个字符")
      .max(64, "用户名最多 64 个字符"),
    phone: z.string().regex(/^\d{11}$/, "请输入 11 位手机号"),
    password: z
      .string()
      .min(6, "密码至少 6 个字符")
      .max(128, "密码最多 128 个字符"),
    confirmPassword: z.string().min(1, "请再次输入密码"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
