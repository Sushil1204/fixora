import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface StepperProps {
  steps: { id: string; label: string }[];
  current: number;
  className?: string;
}

/**
 * Booking progress. Numbering is meaningful here: the steps are a real
 * sequence the customer works through.
 */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <nav aria-label="Booking progress" className={className}>
      <ol className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {steps.map((step, index) => {
          const state =
            index < current ? "done" : index === current ? "current" : "todo";
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1.5">
              <div
                aria-current={state === "current" ? "step" : undefined}
                className="flex min-w-0 items-center gap-2"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-[13px] font-semibold",
                    state === "done" && "border-brand bg-brand text-white",
                    state === "current" &&
                      "border-brand bg-brand-soft text-brand",
                    state === "todo" &&
                      "border-line bg-surface text-ink-muted",
                  )}
                >
                  {state === "done" ? (
                    <Check aria-hidden="true" className="size-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "hidden truncate text-[13px] font-medium sm:block",
                    state === "current" ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {step.label}
                  <span className="sr-only">
                    {state === "done"
                      ? " (completed)"
                      : state === "current"
                        ? " (current step)"
                        : " (not started)"}
                  </span>
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px w-full min-w-2 flex-1",
                    index < current ? "bg-brand" : "bg-line",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[13px] font-medium text-ink-secondary sm:hidden">
        Step {current + 1} of {steps.length}: {steps[current]?.label}
      </p>
    </nav>
  );
}
