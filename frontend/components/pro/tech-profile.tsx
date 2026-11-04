"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  MapPin,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { SERVICE_CATEGORIES } from "@/lib/mock-data";
import { TECHNICIAN, WEEKDAYS } from "@/lib/technician";
import { CategoryIcon } from "@/components/shell/category-icon";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function TechProfile() {
  const { availability, technicians, hydrated } = useDemoStore();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const skills = SERVICE_CATEGORIES.filter((category) =>
    TECHNICIAN.skills.includes(category.id),
  );
  const workingDays = WEEKDAYS.filter(({ day }) =>
    availability.workingDays.includes(day),
  ).map(({ short }) => short);
  const record = technicians.find((entry) => entry.id === TECHNICIAN.id);
  const verification = record?.verification ?? "verified";
  const verificationCopy =
    verification === "verified"
      ? (record?.verificationNote ?? TECHNICIAN.verification)
      : verification === "pending"
        ? "Your documents are waiting for operations review. Approval is simulated in this demo."
        : (record?.verificationNote ??
          "Operations asked for updated documents before this demo profile can take jobs.");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px] font-[680] leading-tight tracking-[-0.015em] text-ink sm:text-[30px]">
          Technician profile
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          Your skills, coverage and demo verification. This is a fictional
          technician profile used for the product demonstration.
        </p>
      </div>

      {/* Identity */}
      <section
        aria-labelledby="identity-heading"
        className="rounded-lg border border-line bg-surface p-5"
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-[18px] font-semibold text-white"
          >
            {TECHNICIAN.initials}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="identity-heading"
                className="text-[19px] font-semibold leading-tight text-ink"
              >
                {TECHNICIAN.name}
              </h2>
              <Badge tone={availability.online ? "success" : "neutral"} dot>
                {availability.online ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">
              {TECHNICIAN.technicianCode} · joined {TECHNICIAN.memberSince}
            </p>

            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-secondary">
              <div className="inline-flex items-center gap-1.5">
                <Star
                  aria-hidden="true"
                  className="size-4 fill-accent text-accent"
                />
                <dt className="sr-only">Rating</dt>
                <dd>
                  <span className="font-semibold text-ink">
                    {TECHNICIAN.rating}
                  </span>{" "}
                  demo rating
                </dd>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Wrench aria-hidden="true" className="size-4 text-ink-muted" />
                <dt className="sr-only">Jobs completed</dt>
                <dd>{TECHNICIAN.jobsCompleted} jobs completed</dd>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <BadgeCheck
                  aria-hidden="true"
                  className="size-4 text-ink-muted"
                />
                <dt className="sr-only">Experience</dt>
                <dd>{TECHNICIAN.yearsExperience} years experience</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-4 flex gap-3 rounded-md border border-brand/15 bg-brand-subtle p-3.5">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-brand"
          />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
              Simulated verification
              <Badge
                tone={
                  verification === "verified"
                    ? "success"
                    : verification === "pending"
                      ? "warning"
                      : "danger"
                }
                dot
              >
                {verification === "verified"
                  ? "Verified"
                  : verification === "pending"
                    ? "Pending review"
                    : "Rejected"}
              </Badge>
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              {verificationCopy}
            </p>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section
        aria-labelledby="skills-heading"
        className="rounded-lg border border-line bg-surface p-5"
      >
        <h2 id="skills-heading" className="text-[16px] font-semibold text-ink">
          Skill categories
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          Job types this demo technician can be assigned.
        </p>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {skills.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-3 rounded-md border border-line p-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                <CategoryIcon icon={category.icon} className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink">
                  {category.name}
                </p>
                <p className="text-[12px] text-ink-muted">
                  {category.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Coverage and schedule */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section
          aria-labelledby="coverage-heading"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <h2
            id="coverage-heading"
            className="text-[16px] font-semibold text-ink"
          >
            Coverage area
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
          <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
            Illustrative areas. No geofencing, live location or routing is used.
          </p>
        </section>

        <section
          aria-labelledby="schedule-heading"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <h2
            id="schedule-heading"
            className="text-[16px] font-semibold text-ink"
          >
            Availability
          </h2>
          <p className="mt-2 flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            <CalendarClock aria-hidden="true" className="size-4 text-brand" />
            {TECHNICIAN.workWindow}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            {workingDays.length > 0
              ? workingDays.join(" · ")
              : "No working days selected"}
          </p>
          <Link
            href="/technician/availability"
            className={cn(
              buttonStyles({ variant: "secondary", size: "sm" }),
              "mt-3",
            )}
          >
            Edit availability
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </section>
      </div>

      {/* Cross-portal */}
      <section
        aria-labelledby="portal-heading"
        className="rounded-lg border border-line bg-surface p-5"
      >
        <h2 id="portal-heading" className="text-[16px] font-semibold text-ink">
          Shared demo state
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          This portal and the customer booking view read the same browser store.
          When you change a job status here, the customer&apos;s timeline updates
          the next time you open it.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/" className={buttonStyles({ variant: "secondary" })}>
            Open customer view
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/technician"
            className={buttonStyles({ variant: "ghost" })}
          >
            Back to jobs
          </Link>
        </div>
      </section>

      <Notice className="text-[12.5px] leading-relaxed">
        Dispatching, SMS updates, navigation and payouts are simulated. No real
        identity checks, payments or live tracking are part of this demo.
      </Notice>
    </div>
  );
}
