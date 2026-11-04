import { cn } from "@/lib/cn";
import type { BookingStatus } from "@/lib/types";

type Tone = "success" | "warning" | "danger" | "info" | "brand" | "accent" | "neutral";

const tones: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-accent-strong",
  neutral: "bg-[#f2f4f7] text-ink-secondary",
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  /** Show a leading status dot (text always remains visible) */
  dot?: boolean;
}

export function Badge({ children, tone = "neutral", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[13px] font-semibold leading-none",
        tones[tone],
        className,
      )}
    >
      {dot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}

const statusMeta: Record<
  BookingStatus,
  { label: string; tone: Tone }
> = {
  requested: { label: "Requested", tone: "warning" },
  assigned: { label: "Assigned", tone: "info" },
  accepted: { label: "Accepted", tone: "brand" },
  on_the_way: { label: "On the way", tone: "brand" },
  arrived: { label: "Arrived", tone: "info" },
  in_progress: { label: "In progress", tone: "accent" },
  awaiting_approval: { label: "Awaiting approval", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

/** Status badge always includes text — never colour alone. */
export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function statusLabel(status: BookingStatus): string {
  return statusMeta[status].label;
}
