import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  Dices,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import type {
  GenerationRecord,
  ImageStyle,
  ProGenerateInput,
  SimpleGenerateInput,
} from "../../../shared/api/types";
import { cn } from "../../../shared/lib/utils";
import { Spinner } from "../../../shared/components/spinner";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { useWorkspaceStore } from "../store";
import {
  proGenerationSchema,
  simpleGenerationSchema,
  type ProGenerationValues,
  type SimpleGenerationValues,
} from "../schemas";
import { ModeTabs } from "./mode-tabs";
import { StylePicker } from "./style-picker";

const sizePresets = [
  { label: "1:1", width: 512, height: 512 },
  { label: "3:2", width: 768, height: 512 },
  { label: "2:3", width: 512, height: 768 },
  { label: "16:9", width: 768, height: 432 },
  { label: "9:16", width: 432, height: 768 },
];

const samplers = [
  "Euler a",
  "Euler",
  "DPM++ 2M Karras",
  "DDIM",
  "UniPC",
];

const promptExamples = [
  "雨后的东京街头，霓虹倒映在积水里，电影感广角",
  "漂浮在云海上的白色灯塔，清晨柔光，极简构图",
  "一只戴着飞行员护目镜的柴犬，复古旅行海报",
];

interface GenerationPanelProps {
  mode: "simple" | "pro";
  onModeChange: (mode: "simple" | "pro") => void;
  styles: ImageStyle[];
  stylesLoading: boolean;
  stylesError?: string;
  simplePending: boolean;
  proPending: boolean;
  rerun?: GenerationRecord | null;
  onSimpleGenerate: (input: SimpleGenerateInput) => void;
  onProGenerate: (input: ProGenerateInput) => void;
}

export function GenerationPanel(props: GenerationPanelProps) {
  return (
    <section
      className="min-h-0 overflow-y-auto border-b border-line bg-surface lg:border-b-0 lg:border-r"
      aria-label="生成参数"
    >
      <div className="flex min-h-full flex-col p-4 pb-28 sm:p-5 md:pb-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">创作参数</h2>
            <p className="mt-1 text-xs text-muted">描述画面，让 AI 开始绘制</p>
          </div>
          <span className="rounded-md bg-panel px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            AI Canvas
          </span>
        </div>
        <ModeTabs mode={props.mode} onChange={props.onModeChange} />
        <div className="mt-5">
          {props.mode === "simple" ? (
            <QuickForm {...props} />
          ) : (
            <ProForm {...props} />
          )}
        </div>
      </div>
    </section>
  );
}

function QuickForm({
  styles,
  stylesLoading,
  stylesError,
  simplePending,
  rerun,
  onSimpleGenerate,
}: GenerationPanelProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SimpleGenerationValues>({
    resolver: zodResolver(simpleGenerationSchema),
    defaultValues: { prompt: "", styleId: "" },
  });

  useEffect(() => {
    if (rerun?.mode === "simple") {
      reset({
        prompt: rerun.prompt,
        styleId: rerun.style_id || "",
      });
    }
  }, [rerun, reset]);

  const prompt = watch("prompt") || "";
  const styleId = watch("styleId");
  const submit = handleSubmit((values) =>
    onSimpleGenerate({
      prompt: values.prompt,
      style_id: values.styleId,
    }),
  );

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <PromptField
        id="simple-prompt"
        register={register("prompt")}
        value={prompt}
        error={errors.prompt?.message}
        onUseExample={(value) =>
          setValue("prompt", value, { shouldValidate: true })
        }
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>图片风格</Label>
          {errors.styleId ? (
            <span className="text-xs text-danger" role="alert">
              {errors.styleId.message}
            </span>
          ) : null}
        </div>
        <StylePicker
          styles={styles}
          selectedId={styleId}
          onSelect={(id) =>
            setValue("styleId", id, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          loading={stylesLoading}
          error={stylesError}
        />
      </div>

      <SubmitButton
        pending={simplePending}
        disabled={!prompt.trim() || !styleId}
      />
    </form>
  );
}

function ProForm({
  proPending,
  rerun,
  onProGenerate,
}: GenerationPanelProps) {
  const preferredSize = useWorkspaceStore((state) => state.preferredSize);
  const setPreferredSize = useWorkspaceStore(
    (state) => state.setPreferredSize,
  );
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProGenerationValues>({
    resolver: zodResolver(proGenerationSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      width: preferredSize.width,
      height: preferredSize.height,
      cfgScale: 7,
      steps: 20,
      sampler: "Euler a",
      seed: -1,
    },
  });

  useEffect(() => {
    if (rerun?.mode === "pro") {
      reset({
        prompt: rerun.prompt,
        negativePrompt: rerun.negative_prompt || "",
        width: rerun.width || 512,
        height: rerun.height || 512,
        cfgScale: rerun.cfg_scale || 7,
        steps: rerun.steps || 20,
        sampler: rerun.sampler || "Euler a",
        seed: rerun.seed || -1,
      });
    }
  }, [rerun, reset]);

  const prompt = watch("prompt") || "";
  const width = Number(watch("width"));
  const height = Number(watch("height"));
  const submit = handleSubmit((values) => {
    setPreferredSize({ width: values.width, height: values.height });
    onProGenerate({
      prompt: values.prompt,
      negative_prompt: values.negativePrompt,
      width: values.width,
      height: values.height,
      cfg_scale: values.cfgScale,
      steps: values.steps,
      sampler: values.sampler,
      seed: values.seed,
    });
  });

  const applySize = (size: (typeof sizePresets)[number]) => {
    setValue("width", size.width, { shouldValidate: true, shouldDirty: true });
    setValue("height", size.height, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <PromptField
        id="pro-prompt"
        register={register("prompt")}
        value={prompt}
        error={errors.prompt?.message}
        onUseExample={(value) =>
          setValue("prompt", value, { shouldValidate: true })
        }
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="negative-prompt">反向提示词</Label>
          <span className="text-[11px] text-muted">可选</span>
        </div>
        <Textarea
          id="negative-prompt"
          rows={2}
          className="min-h-20"
          placeholder="不希望出现的元素，例如：模糊、低质量、多余手指"
          {...register("negativePrompt")}
        />
        {errors.negativePrompt ? (
          <p className="text-xs text-danger">
            {errors.negativePrompt.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <Label>画面尺寸</Label>
        <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="尺寸比例">
          {sizePresets.map((size) => (
            <button
              key={size.label}
              type="button"
              onClick={() => applySize(size)}
              className={cn(
                "h-8 rounded-md border text-[11px] transition",
                width === size.width && height === size.height
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line bg-panel text-muted hover:text-ink",
              )}
            >
              {size.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div>
            <Label htmlFor="width" className="sr-only">
              宽度
            </Label>
            <Input
              id="width"
              type="number"
              min={64}
              max={2048}
              aria-invalid={Boolean(errors.width)}
              {...register("width", { valueAsNumber: true })}
            />
            <FieldError message={errors.width?.message} />
          </div>
          <span className="text-xs text-muted">×</span>
          <div>
            <Label htmlFor="height" className="sr-only">
              高度
            </Label>
            <Input
              id="height"
              type="number"
              min={64}
              max={2048}
              aria-invalid={Boolean(errors.height)}
              {...register("height", { valueAsNumber: true })}
            />
            <FieldError message={errors.height?.message} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="steps">Steps</Label>
          <Input
            id="steps"
            type="number"
            min={1}
            max={150}
            aria-invalid={Boolean(errors.steps)}
            {...register("steps", { valueAsNumber: true })}
          />
          <FieldError message={errors.steps?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cfg-scale">CFG Scale</Label>
          <Input
            id="cfg-scale"
            type="number"
            min={1}
            max={30}
            step="0.5"
            aria-invalid={Boolean(errors.cfgScale)}
            {...register("cfgScale", { valueAsNumber: true })}
          />
          <FieldError message={errors.cfgScale?.message} />
        </div>
      </div>

      <details className="group rounded-xl border border-line bg-panel/35">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-medium text-muted [&::-webkit-details-marker]:hidden">
          高级参数
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-line p-3">
          <div className="space-y-2">
            <Label htmlFor="sampler">Sampler</Label>
            <Input
              id="sampler"
              list="sampler-options"
              aria-invalid={Boolean(errors.sampler)}
              {...register("sampler")}
            />
            <datalist id="sampler-options">
              {samplers.map((sampler) => (
                <option key={sampler} value={sampler} />
              ))}
            </datalist>
            <FieldError message={errors.sampler?.message} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seed">Seed</Label>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] text-muted transition hover:text-ink"
                onClick={() =>
                  setValue("seed", -1, { shouldValidate: true })
                }
              >
                <Dices className="h-3.5 w-3.5" />
                随机
              </button>
            </div>
            <Input
              id="seed"
              type="number"
              step={1}
              aria-invalid={Boolean(errors.seed)}
              {...register("seed", { valueAsNumber: true })}
            />
            <p className="text-[11px] text-muted">
              -1 表示随机；固定种子必须大于 0
            </p>
            <FieldError message={errors.seed?.message} />
          </div>
        </div>
      </details>

      <SubmitButton pending={proPending} disabled={!prompt.trim()} />
    </form>
  );
}

function PromptField({
  id,
  register,
  value,
  error,
  onUseExample,
}: {
  id: string;
  register: UseFormRegisterReturn;
  value: string;
  error?: string;
  onUseExample: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>提示词</Label>
        <span className="font-mono text-[11px] text-muted">
          {value.length} / 2000
        </span>
      </div>
      <Textarea
        id={id}
        rows={5}
        maxLength={2000}
        placeholder="描述画面主体、环境、光线、构图和风格…"
        aria-invalid={Boolean(error)}
        {...register}
      />
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {promptExamples.map((example, index) => (
          <button
            key={example}
            type="button"
            onClick={() => onUseExample(example)}
            className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-[11px] text-muted transition hover:border-brand/40 hover:text-brand"
            title={example}
          >
            示例 {index + 1}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function SubmitButton({
  pending,
  disabled,
}: {
  pending: boolean;
  disabled: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:mt-2 md:border-0 md:bg-transparent md:p-0">
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={disabled || pending}
      >
        {pending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <Sparkles />
        )}
        {pending ? "正在提交任务…" : "开始生成"}
      </Button>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-[11px] text-danger" role="alert">
      {message}
    </p>
  ) : null;
}
