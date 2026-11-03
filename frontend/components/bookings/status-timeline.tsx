import { Check } from "lucide-react";
import { formatTimestamp } from "@/lib/format";
import { statusLabel } from "@/components/ui/badge";
import type { TimelineStep } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Booking status timeline. Each reached step shows its timestamp and a short
 * explanation; upcoming steps are visibly pending so the next step is clear.
 */
export function StatusTimeline({ timeline }: { timeline: TimelineStep[] }) {
  const lastReached = timeline.reduce(
    (acc, step, index) => (step.at ? index : acc),
    0,
  );

  return (
    <ol className="space-y-0">
      {timeline.map((step, index) => {
        const reached = Boolean(step.at);
        const current = index === lastReached && reached;
        const isLast = index === timeline.length - 1;

        return (
          <li key={`${step.status}-${index}`} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px",
                  reached ? "bg-brand/30" : "bg-line",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border",
                reached && !current && "border-brand bg-brand text-white",
                current && "border-brand bg-brand-soft text-brand ring-4 ring-brand-soft/60",
                !reached && "border-line bg-surface text-ink-muted",
              )}
            >
              {reached && !current ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 rounded-full",
                    current ? "bg-brand" : "bg-line-strong",
                  )}
                />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p
                  className={cn(
                    "text-[14.5px] font-semibold",
                    reached ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {statusLabel(step.status)}
                  {current ? (
                    <span className="ml-1.5 rounded-sm bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                      Current
                    </span>
                  ) : null}
                </p>
                <p className="text-[12.5px] tabular-nums text-ink-muted">
                  {step.at ? formatTimestamp(step.at) : "Pending"}
                </p>
              </div>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-muted">
                {step.note}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
