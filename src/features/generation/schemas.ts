import { z } from "zod";

export const simpleGenerationSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "请输入提示词")
    .max(2000, "提示词最多 2000 个字符"),
  styleId: z.string().uuid("请选择有效的图片风格"),
});

const dimensionSchema = z.coerce
  .number({ invalid_type_error: "请输入有效数值" })
  .int("请输入整数")
  .min(64, "最小值为 64")
  .max(2048, "最大值为 2048");

export const proGenerationSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "请输入提示词")
    .max(2000, "提示词最多 2000 个字符"),
  negativePrompt: z
    .string()
    .trim()
    .max(2000, "反向提示词最多 2000 个字符"),
  width: dimensionSchema,
  height: dimensionSchema,
  cfgScale: z.coerce
    .number({ invalid_type_error: "请输入有效数值" })
    .min(1, "CFG Scale 最小值为 1")
    .max(30, "CFG Scale 最大值为 30"),
  steps: z.coerce
    .number({ invalid_type_error: "请输入有效数值" })
    .int("Steps 必须为整数")
    .min(1, "Steps 最小值为 1")
    .max(150, "Steps 最大值为 150"),
  sampler: z
    .string()
    .trim()
    .min(1, "请选择或输入 Sampler")
    .max(64, "Sampler 最多 64 个字符"),
  seed: z.coerce
    .number({ invalid_type_error: "请输入有效种子" })
    .int("Seed 必须为整数")
    .refine((value) => value === -1 || value > 0, {
      message: "随机种子为 -1，固定种子必须大于 0",
    })
    .refine((value) => Number.isSafeInteger(value), {
      message: "Seed 数值过大",
    }),
});

export type SimpleGenerationValues = z.infer<typeof simpleGenerationSchema>;
export type ProGenerationValues = z.infer<typeof proGenerationSchema>;
