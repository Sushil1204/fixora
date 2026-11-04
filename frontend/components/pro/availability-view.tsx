"use client";

import Link from "next/link";
import { CalendarClock, Check, Clock, MapPin, Wifi, WifiOff } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { upcomingDates } from "@/lib/format";
import { isAssignedJob } from "@/lib/job-workflow";
import { TECHNICIAN, WEEKDAYS, belongsToTechnician } from "@/lib/technician";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export function AvailabilityView() {
  const {
    availability,
    bookings,
    hydrated,
    setTechnicianOnline,
    toggleWorkingDay,
  } = useDemoStore();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const online = availability.online;
  const today = upcomingDates(1)[0];
  const todaysJobs = bookings.filter(
    (booking) =>
      belongsToTechnician(booking) &&
      isAssignedJob(booking.status) &&
      booking.status !== "completed" &&
      booking.date === today,
  );
  const waitingApproval = todaysJobs.filter(
    (booking) => booking.status === "awaiting_approval",
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px] font-[680] leading-tight tracking-[-0.015em] text-ink sm:text-[30px]">
          Availability
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          Control when the demo dispatch can assign work. Changes save to this
          browser instantly.
        </p>
      </div>

      {/* Online toggle */}
      <section
        aria-labelledby="online-heading"
        className="rounded-lg border border-line bg-surface p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-full",
                online
                  ? "bg-success-soft text-success"
                  : "bg-canvas text-ink-muted",
              )}
            >
              {online ? (
                <Wifi className="size-5" />
              ) : (
                <WifiOff className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <h2
                id="online-heading"
                className="text-[16px] font-semibold text-ink"
              >
                {online ? "You're online" : "You're offline"}
              </h2>
              <Badge
                tone={online ? "success" : "neutral"}
                dot
                className="mt-1.5"
              >
                {online ? "Accepting jobs" : "Paused"}
              </Badge>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={online}
            aria-label="Accepting new jobs"
            onClick={() => setTechnicianOnline(!online)}
            className={cn(
              "relative inline-flex h-11 w-16 shrink-0 items-center rounded-full border px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              online
                ? "border-success bg-success"
                : "border-line-strong bg-[#d0d5dd]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-8 place-items-center rounded-full bg-white shadow-sm transition-transform duration-200",
                online
                  ? "translate-x-6 text-success"
                  : "translate-x-0 text-ink-muted",
              )}
            >
              {online ? (
                <Check className="size-4" strokeWidth={3} />
              ) : (
                <span className="size-2 rounded-full bg-line-strong" />
              )}
            </span>
          </button>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
          {online
            ? "New assignments can appear on your jobs list. Dispatch is simulated in this demo."
            : "New assignments are paused. Jobs you've already accepted stay on your list."}
        </p>
      </section>

      {/* Today's load */}
      <section
        aria-labelledby="load-heading"
        className="rounded-lg border border-line bg-surface p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="load-heading" className="text-[16px] font-semibold text-ink">
            Today&apos;s load
          </h2>
          <Link
            href="/technician"
            className="rounded-sm text-[13px] font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Open jobs
          </Link>
        </div>

        <dl className="mt-3 grid grid-cols-3 divide-x divide-line rounded-md border border-line">
          <div className="grid content-start gap-1 px-3 py-3">
            <dt className="col-start-1 row-start-2 min-h-8 text-[11.5px] font-medium leading-snug text-ink-muted">
              Scheduled
            </dt>
            <dd className="col-start-1 row-start-1 text-[20px] font-[680] leading-none tabular-nums text-ink">
              {todaysJobs.length}
            </dd>
          </div>
          <div className="grid content-start gap-1 px-3 py-3">
            <dt className="col-start-1 row-start-2 min-h-8 text-[11.5px] font-medium leading-snug text-ink-muted">
              Awaiting approval
            </dt>
            <dd className="col-start-1 row-start-1 text-[20px] font-[680] leading-none tabular-nums text-ink">
              {waitingApproval}
            </dd>
          </div>
          <div className="grid content-start gap-1 px-3 py-3">
            <dt className="col-start-1 row-start-2 min-h-8 text-[11.5px] font-medium leading-snug text-ink-muted">
              Days a week
            </dt>
            <dd className="col-start-1 row-start-1 text-[20px] font-[680] leading-none text-ink">
              {availability.workingDays.length}
            </dd>
          </div>
        </dl>
      </section>

      {/* Working days */}
      <section
        aria-labelledby="days-heading"
        className="rounded-lg border border-line bg-surface p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 id="days-heading" className="text-[16px] font-semibold text-ink">
              Working days
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Days you&apos;re willing to take jobs. This only changes the demo
              schedule.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
            <CalendarClock aria-hidden="true" className="size-4" />
            {availability.workingDays.length} of 7
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {WEEKDAYS.map(({ day, short }) => {
            const active = availability.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                aria-label={DAY_LABELS[day]}
                onClick={() => toggleWorkingDay(day)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-1.5 rounded-md border px-2 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface text-ink-secondary hover:border-line-strong hover:bg-canvas",
                )}
              >
                {active ? (
                  <Check
                    aria-hidden="true"
                    className="size-3.5"
                    strokeWidth={3}
                  />
                ) : null}
                {short}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
          Sunday is off by default. Turning a day off doesn&apos;t remove jobs
          you&apos;ve already accepted.
        </p>
      </section>

      {/* Hours and coverage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section
          aria-labelledby="hours-heading"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <h2 id="hours-heading" className="text-[16px] font-semibold text-ink">
            Shift hours
          </h2>
          <p className="mt-2 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Clock aria-hidden="true" className="size-4 text-brand" />
            {TECHNICIAN.workWindow}
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            Fixed by the demo dispatch. Editing shifts isn&apos;t part of this
            phase.
          </p>
        </section>

        <section
          aria-labelledby="coverage-heading"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <h2
            id="coverage-heading"
            className="text-[16px] font-semibold text-ink"
          >
            Service coverage
          </h2>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {TECHNICIAN.coverage.map((area) => (
              <li
                key={area}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-subtle px-2 py-1.5 text-[12px] font-medium text-brand"
              >
                <MapPin aria-hidden="true" className="size-3.5" />
                {area}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
            Areas are illustrative. No geofencing or live location is used.
          </p>
        </section>
      </div>

      <Notice className="text-[12.5px] leading-relaxed">
        Availability is stored in this browser only. There is no dispatch system,
        SMS or calendar sync behind it — all of that is simulated for this
        demonstration.
      </Notice>

      <Link
        href="/technician"
        className="inline-flex min-h-11 items-center text-[13.5px] font-semibold text-brand hover:underline"
      >
        Back to today&apos;s jobs
      </Link>

      <p className="text-[12px] leading-relaxed text-ink-muted">
        Signed in as {TECHNICIAN.name} ({TECHNICIAN.technicianCode}).
      </p>
    </div>
  );
}
