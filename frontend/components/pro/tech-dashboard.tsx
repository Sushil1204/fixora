"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  ReceiptText,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import type { Booking } from "@/lib/types";
import {
  formatINR,
  formatSlot,
  formatTimestamp,
  friendlyDate,
  upcomingDates,
} from "@/lib/format";
import { isAssignedJob } from "@/lib/job-workflow";
import {
  TECHNICIAN,
  belongsToTechnician,
  computeEarnings,
  quoteTotal,
} from "@/lib/technician";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { JobCard } from "./job-card";

interface AttentionItem {
  booking: Booking;
  kind: "quote" | "accept" | "request";
  title: string;
  detail: string;
}

const ATTENTION_STYLES: Record<
  AttentionItem["kind"],
  { wrapper: string; Icon: typeof ClipboardList }
> = {
  quote: { wrapper: "bg-warning-soft text-warning", Icon: ReceiptText },
  accept: { wrapper: "bg-info-soft text-info", Icon: CalendarCheck },
  request: { wrapper: "bg-brand-soft text-brand", Icon: ClipboardList },
};

function SectionHeading({
  id,
  title,
  detail,
}: {
  id: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2
        id={id}
        className="text-[18px] font-[650] tracking-[-0.01em] text-ink sm:text-[20px]"
      >
        {title}
      </h2>
      <p className="text-[12.5px] text-ink-muted">{detail}</p>
    </div>
  );
}

export function TechDashboard() {
  const { bookings: allBookings, addresses, jobWork, availability, hydrated } =
    useDemoStore();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const bookings = allBookings.filter((booking) => belongsToTechnician(booking));
  const today = upcomingDates(1)[0];
  const activeJobs = bookings.filter(
    (booking) =>
      isAssignedJob(booking.status) && booking.status !== "completed",
  );
  const todaysJobs = activeJobs.filter((booking) => booking.date === today);
  const upcomingJobs = activeJobs.filter((booking) => booking.date > today);
  const requests = bookings.filter((booking) => booking.status === "requested");
  const pendingQuotes = activeJobs.filter(
    (booking) => booking.status === "awaiting_approval",
  );
  const acceptedPending = activeJobs.filter(
    (booking) => booking.status === "assigned",
  );

  const earnings = computeEarnings(bookings, jobWork);

  const attention: AttentionItem[] = [
    ...pendingQuotes.map((booking) => {
      const quote = jobWork[booking.id]?.quote;
      return {
        booking,
        kind: "quote" as const,
        title: `Approval pending · ${booking.reference}`,
        detail: quote
          ? `${formatINR(quoteTotal(quote))} quote sent ${formatTimestamp(
              quote.submittedAt,
            )}`
          : "Extra work is waiting for the customer",
      };
    }),
    ...acceptedPending.map((booking) => ({
      booking,
      kind: "accept" as const,
      title: `Accept to confirm · ${booking.reference}`,
      detail: `${booking.serviceName} · ${formatSlot(booking.slot)}`,
    })),
    ...requests.map((booking) => ({
      booking,
      kind: "request" as const,
      title: `New request · ${booking.reference}`,
      detail: `${booking.serviceName} · ${friendlyDate(booking.date)}`,
    })),
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="space-y-6">
      {/* Greeting + today's workload */}
      <section
        aria-labelledby="tech-greeting"
        className="relative overflow-hidden rounded-xl bg-brand-deep text-white shadow-sm"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-white/5"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-10 size-32 rounded-full bg-white/5"
        />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/75">
                Technician workspace
              </p>
              <h1
                id="tech-greeting"
                className="mt-1.5 text-[24px] font-[680] leading-tight tracking-[-0.015em] sm:text-[28px]"
              >
                {greeting}, {TECHNICIAN.shortName}
              </h1>
              <p className="mt-1 text-[13.5px] text-white/85">
                {dateLabel} · {todaysJobs.length}{" "}
                {todaysJobs.length === 1 ? "job" : "jobs"} scheduled
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold",
                availability.online
                  ? "bg-white/15 text-white"
                  : "bg-white/10 text-white/80",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full",
                  availability.online ? "bg-[#6ee7a8]" : "bg-white/50",
                )}
              />
              {availability.online ? "Accepting jobs" : "Not accepting jobs"}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "Today", value: String(todaysJobs.length) },
              { label: "Needs action", value: String(attention.length) },
              { label: "Upcoming", value: String(upcomingJobs.length) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="grid content-start gap-1 rounded-md bg-white/10 px-3 py-2.5"
              >
                <dt className="col-start-1 row-start-2 min-h-8 text-[11px] font-medium leading-snug text-white/80">
                  {stat.label}
                </dt>
                <dd className="col-start-1 row-start-1 text-[19px] font-[680] leading-none tabular-nums text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {!availability.online ? (
        <Notice tone="warning" title="You're offline">
          New assignments are paused while you&apos;re offline. Toggle
          availability in the header or on the Availability tab. Dispatch is
          simulated in this demo.
        </Notice>
      ) : null}

      <Notice className="text-[12.5px] leading-relaxed">
        Demo workspace: dispatch, SMS alerts and directions are simulated. Job
        updates save to this browser and appear in the customer booking timeline
        immediately.
      </Notice>

      {/* Outstanding actions */}
      {attention.length > 0 ? (
        <section aria-labelledby="attention-heading">
          <SectionHeading
            id="attention-heading"
            title="Needs your attention"
            detail={`${attention.length} ${
              attention.length === 1 ? "item" : "items"
            }`}
          />
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {attention.map((item) => {
              const { wrapper, Icon } = ATTENTION_STYLES[item.kind];
              return (
                <li key={`${item.kind}-${item.booking.id}`}>
                  <Link
                    href={`/technician/jobs/${item.booking.id}`}
                    className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-md",
                        wrapper,
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">
                        {item.title}
                      </span>
                      <span className="block truncate text-[12.5px] text-ink-muted">
                        {item.detail}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-ink-muted"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Today */}
      <section aria-labelledby="today-heading">
        <SectionHeading
          id="today-heading"
          title="Today"
          detail={
            todaysJobs.length > 0
              ? `${todaysJobs.length} scheduled`
              : "Schedule clear"
          }
        />
        {todaysJobs.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              compact
              icon={CalendarDays}
              title="No jobs today"
              description="Nothing is scheduled for today. New assignments from dispatch appear here — simulated in this demo."
              action={
                <Link
                  href="/technician/availability"
                  className={buttonStyles({ variant: "secondary", size: "md" })}
                >
                  Review availability
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {todaysJobs.map((booking) => (
              <li key={booking.id}>
                <JobCard
                  booking={booking}
                  address={addresses.find((a) => a.id === booking.addressId)}
                  work={jobWork[booking.id]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming */}
      <section aria-labelledby="upcoming-heading">
        <SectionHeading
          id="upcoming-heading"
          title="Upcoming"
          detail={
            upcomingJobs.length > 0
              ? `${upcomingJobs.length} assigned`
              : "Nothing scheduled"
          }
        />
        {upcomingJobs.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-5 text-[13.5px] text-ink-muted">
            No future jobs assigned. The demo schedules new work from the
            customer portal.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {upcomingJobs.map((booking) => (
              <li key={booking.id}>
                <JobCard
                  booking={booking}
                  address={addresses.find((a) => a.id === booking.addressId)}
                  work={jobWork[booking.id]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Earnings snapshot */}
      <section
        aria-labelledby="earnings-snapshot-heading"
        className="rounded-lg border border-line bg-surface p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2
              id="earnings-snapshot-heading"
              className="text-[16px] font-semibold text-ink"
            >
              Earnings snapshot
            </h2>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Completed jobs only · illustrative demo figures
            </p>
          </div>
          <Link
            href="/technician/earnings"
            className="inline-flex items-center gap-1 rounded-sm text-[13.5px] font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            View earnings
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-line rounded-md border border-line">
          <div className="px-3 py-3">
            <dt className="text-[11.5px] font-medium text-ink-muted">
              Net payout
            </dt>
            <dd className="mt-1 text-[17px] font-[680] tabular-nums text-ink">
              {formatINR(earnings.payout)}
            </dd>
          </div>
          <div className="px-3 py-3">
            <dt className="text-[11.5px] font-medium text-ink-muted">
              Jobs done
            </dt>
            <dd className="mt-1 text-[17px] font-[680] tabular-nums text-ink">
              {earnings.completedCount}
            </dd>
          </div>
          <div className="px-3 py-3">
            <dt className="text-[11.5px] font-medium text-ink-muted">
              Pending
            </dt>
            <dd className="mt-1 text-[17px] font-[680] tabular-nums text-ink">
              {formatINR(earnings.pendingPayout)}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
          Payouts, commission and settlement are simulated. No money moves in
          this demo.
        </p>
      </section>

      {/* Quick links */}
      <section aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="sr-only">
          Technician shortcuts
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/technician/earnings"
            className="flex min-h-14 items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:border-line-strong hover:bg-brand-subtle"
          >
            <span className="grid size-8 place-items-center rounded-md bg-brand-soft text-brand">
              <ReceiptText aria-hidden="true" className="size-4" />
            </span>
            Settlement history
            <ChevronRight
              aria-hidden="true"
              className="ml-auto size-4 text-ink-muted"
            />
          </Link>
          <Link
            href="/technician/profile"
            className="flex min-h-14 items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:border-line-strong hover:bg-brand-subtle"
          >
            <span className="grid size-8 place-items-center rounded-md bg-brand-soft text-brand">
              <CalendarCheck aria-hidden="true" className="size-4" />
            </span>
            Skills &amp; coverage
            <ChevronRight
              aria-hidden="true"
              className="ml-auto size-4 text-ink-muted"
            />
          </Link>
        </div>
      </section>

      <p className="text-[12px] leading-relaxed text-ink-muted">
        Signed in as {TECHNICIAN.name} ({TECHNICIAN.technicianCode}) — a
        fictional technician profile for this product demonstration.
      </p>
    </div>
  );
}
