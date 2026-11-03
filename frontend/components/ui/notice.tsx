import { Info, ShieldCheck, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "warning" | "success";

const tones: Record<Tone, { wrapper: string; icon: string; Icon: typeof Info }> = {
  info: {
    wrapper: "border-line bg-brand-subtle text-ink-secondary",
    icon: "text-brand",
    Icon: Info,
  },
  warning: {
    wrapper: "border-[#f3dcb4] bg-warning-soft text-[#6b3a00]",
    icon: "text-warning",
    Icon: TriangleAlert,
  },
  success: {
    wrapper: "border-[#c7e8d5] bg-success-soft text-[#0f5c34]",
    icon: "text-success",
    Icon: ShieldCheck,
  },
};

interface NoticeProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Inline explanatory panel for estimates, demo disclaimers and confirmations. */
export function Notice({ tone = "info", title, children, className }: NoticeProps) {
  const { wrapper, icon, Icon } = tones[tone];
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-4 text-[14px] leading-relaxed",
        wrapper,
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-[18px] shrink-0", icon)} />
      <div className="min-w-0">
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        <div className={title ? "mt-1" : undefined}>{children}</div>
      </div>
    </div>
  );
}
