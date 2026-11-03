import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  /** Smaller variant for inline panels */
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong bg-surface px-6 py-8 text-center"
          : "flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong bg-surface px-6 py-14 text-center"
      }
    >
      <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="max-w-sm text-[15px] leading-relaxed text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
