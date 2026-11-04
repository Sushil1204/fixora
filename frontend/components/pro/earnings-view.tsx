"use client";

import { BadgeIndianRupee, ReceiptText, Wallet } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { formatDate, formatINR, formatTimestamp } from "@/lib/format";
import {
  DEMO_COMMISSION_RATE,
  SETTLEMENT_DAYS,
  belongsToTechnician,
  computeEarnings,
} from "@/lib/technician";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

const COMMISSION_PERCENT = Math.round(DEMO_COMMISSION_RATE * 100);

export function EarningsView() {
  const { bookings, jobWork, hydrated } = useDemoStore();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const earnings = computeEarnings(
    bookings.filter((booking) => belongsToTechnician(booking)),
    jobWork,
  );
  const pendingCount = earnings.entries.filter((entry) => !entry.settled).length;
  const paidCount = earnings.entries.length - pendingCount;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px] font-[680] leading-tight tracking-[-0.015em] text-ink sm:text-[30px]">
          Earnings
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          Completed jobs, commission and settlement status. Every figure here is
          illustrative demo data.
        </p>
      </div>

      <Notice tone="warning" className="text-[12.5px] leading-relaxed">
        <strong>Illustrative only.</strong> Payouts, commission and settlement
        dates are simulated. No bank account, invoice or payment is involved.
      </Notice>

      {/* Summary */}
      <section
        aria-labelledby="payout-summary-heading"
        className="relative overflow-hidden rounded-xl bg-brand-deep text-white shadow-sm"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-white/5"
        />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="payout-summary-heading"
                className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/80"
              >
                Net estimated payout
              </h2>
              <p className="mt-2 text-[34px] font-[680] leading-none tabular-nums">
                {formatINR(earnings.payout)}
              </p>
              <p className="mt-1.5 text-[13px] text-white/85">
                After {COMMISSION_PERCENT}% demo commission ·{" "}
                {earnings.completedCount} completed{" "}
                {earnings.completedCount === 1 ? "job" : "jobs"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1.5 text-[12px] font-semibold">
              <Wallet aria-hidden="true" className="size-3.5" />
              Demo figures
            </span>
          </div>

          <dl className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-white/10 px-3 py-2.5">
              <dt className="text-[11px] font-medium text-white/80">
                Gross value
              </dt>
              <dd className="mt-1 text-[18px] font-[680] tabular-nums">
                {formatINR(earnings.gross)}
              </dd>
            </div>
            <div className="rounded-md bg-white/10 px-3 py-2.5">
              <dt className="text-[11px] font-medium text-white/80">
                Commission
              </dt>
              <dd className="mt-1 text-[18px] font-[680] tabular-nums">
                −{formatINR(earnings.commission)}
              </dd>
            </div>
            <div className="rounded-md bg-white/10 px-3 py-2.5">
              <dt className="text-[11px] font-medium text-white/80">
                Approved extra work
              </dt>
              <dd className="mt-1 text-[18px] font-[680] tabular-nums">
                {formatINR(earnings.extra)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Settlement split */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section
          aria-labelledby="pending-heading"
          className="rounded-lg border border-[#f3dcb4] bg-warning-soft p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="pending-heading"
              className="text-[14px] font-semibold text-[#6b3a00]"
            >
              Pending settlement
            </h2>
            <Badge tone="warning">
              {pendingCount} {pendingCount === 1 ? "job" : "jobs"}
            </Badge>
          </div>
          <p className="mt-2 text-[22px] font-[680] tabular-nums text-[#6b3a00]">
            {formatINR(earnings.pendingPayout)}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#7a4a10]">
            Completed within the last {SETTLEMENT_DAYS} days. Settlement is
            simulated.
          </p>
        </section>

        <section
          aria-labelledby="paid-heading"
          className="rounded-lg border border-[#c7e8d5] bg-success-soft p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="paid-heading" className="text-[14px] font-semibold text-[#0f5c34]">
              Paid settlement
            </h2>
            <Badge tone="success">{paidCount} paid</Badge>
          </div>
          <p className="mt-2 text-[22px] font-[680] tabular-nums text-[#0f5c34]">
            {formatINR(earnings.paidPayout)}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#145c39]">
            Older than {SETTLEMENT_DAYS} days. No money was actually transferred.
          </p>
        </section>
      </div>

      {/* Completed jobs */}
      <section aria-labelledby="jobs-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="jobs-heading"
            className="text-[18px] font-[650] tracking-[-0.01em] text-ink sm:text-[20px]"
          >
            Completed jobs
          </h2>
          <p className="text-[12.5px] text-ink-muted">
            {earnings.entries.length} on record
          </p>
        </div>

        {earnings.entries.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={ReceiptText}
              title="No completed jobs yet"
              description="Finish a job from the dashboard and its payout appears here with a demo settlement status."
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {earnings.entries.map((entry) => (
              <li
                key={entry.booking.id}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug text-ink">
                      {entry.booking.serviceName}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {formatDate(entry.booking.date)} · {entry.booking.reference}
                      {entry.completedAt
                        ? ` · closed ${formatTimestamp(entry.completedAt)}`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    tone={entry.settled ? "success" : "warning"}
                    dot
                    className={cn("shrink-0", entry.settled && "text-success")}
                  >
                    {entry.settled ? "Paid" : "Pending"}
                  </Badge>
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-canvas px-3 py-2.5">
                  <div>
                    <dt className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                      Gross
                    </dt>
                    <dd className="mt-0.5 text-[13.5px] font-semibold tabular-nums text-ink">
                      {formatINR(entry.gross)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                      Commission
                    </dt>
                    <dd className="mt-0.5 text-[13.5px] font-semibold tabular-nums text-ink">
                      −{formatINR(entry.commission)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                      Payout
                    </dt>
                    <dd className="mt-0.5 text-[13.5px] font-semibold tabular-nums text-ink">
                      {formatINR(entry.payout)}
                    </dd>
                  </div>
                </dl>

                {entry.extra > 0 ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                    <BadgeIndianRupee aria-hidden="true" className="size-3.5" />
                    Includes {formatINR(entry.extra)} of customer-approved extra
                    work.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-[12px] leading-relaxed text-ink-muted">
        Commission is set at {COMMISSION_PERCENT}% for this demo. Payouts count
        the service charge plus customer-approved extra work, before GST and
        convenience fees.
      </p>
    </div>
  );
}
