import { Info } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { Estimate } from "@/lib/types";
import { cn } from "@/lib/cn";

interface EstimateSummaryProps {
  estimate: Estimate;
  /** Hide the disclaimer when the parent already shows it */
  showDisclaimer?: boolean;
  className?: string;
}

/**
 * Line-item estimate: service charge, convenience fee and tax, then total.
 * The disclaimer always sits next to the amount it qualifies.
 */
export function EstimateSummary({
  estimate,
  showDisclaimer = true,
  className,
}: EstimateSummaryProps) {
  return (
    <div className={cn("rounded-lg border border-line bg-surface p-5", className)}>
      <h2 className="text-[15px] font-semibold text-ink">Estimate breakdown</h2>

      <dl className="mt-3 space-y-2.5">
        {estimate.lines.map((line) => (
          <div key={line.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-[14px] text-ink-secondary">{line.label}</dt>
            <dd className="text-[14px] font-medium tabular-nums text-ink">
              {formatINR(line.amount)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <p className="text-[15px] font-semibold text-ink">Estimated total</p>
        <p className="text-[20px] font-[680] tabular-nums text-ink">
          {formatINR(estimate.total)}
        </p>
      </div>

      {showDisclaimer ? (
        <p className="mt-3 flex gap-2 text-[12.5px] leading-relaxed text-ink-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {estimate.disclaimer} Parts and additional work are quoted separately
          and never started without your approval.
        </p>
      ) : null}
    </div>
  );
}
