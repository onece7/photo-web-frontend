import { ArrowUpRight, Image, Sparkles, WandSparkles } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
import { Logo } from "../../../shared/components/logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <main className="grid min-h-dvh bg-surface lg:grid-cols-[45%_55%]">
      <section className="workspace relative hidden overflow-hidden bg-canvas p-10 text-ink lg:flex lg:flex-col xl:p-14">
        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 mt-16 max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            AI Image Studio
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
            把脑海里的画面，
            <br />
            变成眼前的作品。
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
            使用自然语言描述你的想法，选择风格和参数，让 AI
            完成剩下的创作过程。
          </p>
        </div>

        <div className="relative z-10 my-auto grid grid-cols-2 gap-3 py-14">
          <ArtCard
            className="aspect-[4/5] translate-y-7 from-[#263649] via-[#61788d] to-[#d7b38f]"
            label="光影人像"
            icon={<Sparkles />}
          />
          <ArtCard
            className="aspect-[4/5] -translate-y-4 from-[#614132] via-[#bc7758] to-[#e8c99d]"
            label="落日建筑"
            icon={<WandSparkles />}
          />
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
          <Feature icon={<Image />} label="高分辨率" />
          <Feature icon={<Sparkles />} label="多种风格" />
          <Feature icon={<ArrowUpRight />} label="即刻创作" />
        </div>

        <div className="pointer-events-none absolute -right-28 top-28 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-[#4a6685]/30 blur-3xl" />
      </section>

      <section className="flex min-h-dvh flex-col px-6 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-9">{children}</div>
        </div>
        <p className="text-center text-xs text-muted">
          Photo Web · AI 图片创作工作台
        </p>
      </section>
    </main>
  );
}

function ArtCard({
  className,
  label,
  icon,
}: {
  className: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(255,255,255,.45),transparent_22%),linear-gradient(160deg,transparent_45%,rgba(0,0,0,.32))]" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-12 text-white">
        <span className="text-xs font-medium">{label}</span>
        <span className="rounded-full bg-white/15 p-1.5 backdrop-blur [&_svg]:h-3.5 [&_svg]:w-3.5">
          {icon}
        </span>
      </div>
    </div>
  );
}

function Feature({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-xs text-muted [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-brand">
      {icon}
      {label}
    </div>
  );
}
