"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

/** Shared field styling keeps filters and forms consistent across queues. */
export const adminField =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-[13.5px] text-ink shadow-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15";

export const adminSelect = cn(adminField, "cursor-pointer");

export function AdminPageHeader({
  title,
  description,
  aside,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[24px] font-[680] leading-tight tracking-[-0.015em] text-ink sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {aside ? (
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">{aside}</div>
      ) : null}
    </div>
  );
}

export function AdminSection({
  id,
  title,
  description,
  action,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-surface shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2
            id={id ? `${id}-heading` : undefined}
            className="text-[15px] font-semibold text-ink"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

const KPI_TONES = {
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-accent-strong",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
  neutral: "bg-[#f2f4f7] text-ink-secondary",
} as const;

export function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "brand",
  href,
  illustrative,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof KPI_TONES;
  href?: string;
  illustrative?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium text-ink-muted">{label}</p>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md",
            KPI_TONES[tone],
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-[26px] font-[680] leading-none tracking-[-0.02em] tabular-nums text-ink">
        {value}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">{detail}</p>
      {illustrative ? (
        <span className="mt-2 inline-flex rounded-sm bg-[#f2f4f7] px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Illustrative
        </span>
      ) : null}
    </>
  );

  const className =
    "block rounded-lg border border-line bg-surface p-4 shadow-sm transition-colors";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(className, "hover:border-brand/40 hover:bg-brand-subtle/40")}
      >
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

export function DemoTag({ children = "Demo data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-[#f2f4f7] px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
      {children}
    </span>
  );
}

export function AdminToast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-md"
    >
      <CheckCircle2
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-success"
      />
      <p className="text-[13.5px] leading-relaxed text-ink">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 grid size-6 shrink-0 place-items-center rounded-sm text-ink-muted hover:bg-canvas hover:text-ink"
      >
        <X aria-hidden="true" className="size-4" />
        <span className="sr-only">Dismiss notification</span>
      </button>
    </div>
  );
}

export function AdminPageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
