"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  IndianRupee,
  Scale,
  ShieldCheck,
  TriangleAlert,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import {
  disputeAgeHours,
  disputePriorityMeta,
  formatAge,
  formatRangePeriod,
  withinRange,
} from "@/lib/admin";
import { formatINR, formatSlot, friendlyDate } from "@/lib/format";
import { DEMO_COMMISSION_RATE } from "@/lib/technician";
import type { Booking, DisputeCase } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import {
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  DemoTag,
  KpiCard,
} from "./admin-ui";

const COMMISSION_PERCENT = Math.round(DEMO_COMMISSION_RATE * 100);

const STATUS_ORDER = [
  { status: "requested", label: "Requested", bar: "bg-[#f0b45a]" },
  { status: "assigned", label: "Assigned", bar: "bg-[#7aa7e8]" },
  { status: "accepted", label: "Accepted", bar: "bg-brand-link" },
  { status: "on_the_way", label: "On the way", bar: "bg-[#4f7fce]" },
  { status: "arrived", label: "Arrived", bar: "bg-[#5b9bd5]" },
  { status: "in_progress", label: "In progress", bar: "bg-highlight" },
  { status: "awaiting_approval", label: "Awaiting approval", bar: "bg-warning" },
  { status: "completed", label: "Completed", bar: "bg-success" },
  { status: "cancelled", label: "Cancelled", bar: "bg-[#98a2b3]" },
] as const;

function completedAt(booking: Booking): string {
  return (
    booking.timeline.find((step) => step.status === "completed")?.at ??
    booking.createdAt
  );
}

interface ExceptionRow {
  id: string;
  title: string;
  detail: string;
  count: number;
  href: string;
  cta: string;
  Icon: typeof CircleAlert;
  tone: "danger" | "warning" | "info";
}

export function OverviewView() {
  const { bookings, technicians, disputes, reportingRange, hydrated } =
    useDemoStore();

  if (!hydrated) return <AdminPageSkeleton cards={5} />;

  const period = formatRangePeriod(reportingRange);
  const inRange = bookings.filter((booking) =>
    withinRange(booking.createdAt, reportingRange),
  );
  const completed = bookings.filter(
    (booking) =>
      booking.status === "completed" &&
      withinRange(completedAt(booking), reportingRange),
  );
  const gbv = completed.reduce(
    (sum, booking) => sum + booking.estimate.total,
    0,
  );
  const commission = Math.round(gbv * DEMO_COMMISSION_RATE);
  const activeInRange = inRange.filter(
    (booking) =>
      booking.status !== "completed" && booking.status !== "cancelled",
  ).length;
  const pendingTechnicians = technicians.filter(
    (technician) => technician.verification === "pending",
  );
  const openDisputes = disputes.filter(
    (dispute) => dispute.status !== "resolved",
  );
  const unassigned = bookings.filter((booking) => booking.status === "requested");
  const awaitingApproval = bookings.filter(
    (booking) => booking.status === "awaiting_approval",
  );
  const highPriority = openDisputes.filter(
    (dispute) => dispute.priority === "high",
  );
  const pastSla = openDisputes.filter(
    (dispute) => disputeAgeHours(dispute.openedAt) > dispute.slaHours,
  );

  const exceptions: ExceptionRow[] = [
    {
      id: "unassigned",
      title: "Requests waiting for dispatch",
      detail:
        unassigned.length > 0
          ? unassigned.map((booking) => booking.reference).join(", ")
          : "Every request has a technician.",
      count: unassigned.length,
      href: "/admin/bookings?status=requested",
      cta: "Assign",
      Icon: CalendarDays,
      tone: "warning",
    },
    {
      id: "sla",
      title: "Disputes past their demo SLA",
      detail:
        pastSla.length > 0
          ? pastSla.map((dispute) => dispute.reference).join(", ")
          : "No open case is past its target.",
      count: pastSla.length,
      href: "/admin/disputes",
      cta: "Review",
      Icon: Clock3,
      tone: "danger",
    },
    {
      id: "high",
      title: "High-priority open disputes",
      detail:
        highPriority.length > 0
          ? highPriority.map((dispute) => dispute.reference).join(", ")
          : "No high-priority cases open.",
      count: highPriority.length,
      href: "/admin/disputes?priority=high",
      cta: "Open queue",
      Icon: Scale,
      tone: "danger",
    },
    {
      id: "approvals",
      title: "Technician approvals pending",
      detail:
        pendingTechnicians.length > 0
          ? pendingTechnicians
              .map((technician) => technician.name)
              .join(", ")
          : "All technician documents are reviewed.",
      count: pendingTechnicians.length,
      href: "/admin/technicians?status=pending",
      cta: "Review",
      Icon: UserRoundCheck,
      tone: "info",
    },
    {
      id: "quotes",
      title: "Extra-work quotes awaiting customer approval",          detail:
            awaitingApproval.length > 0
              ? awaitingApproval
                  .map(
                    (booking) =>
                      `${booking.reference} · customer approval needed`,
                  )
                  .join(", ")
              : "No quotes are waiting on the customer.",
      count: awaitingApproval.length,
      href: "/admin/bookings?status=awaiting_approval",
      cta: "Inspect",
      Icon: ClipboardCheck,
      tone: "warning",
    },
  ];

  const openExceptions = exceptions.filter((row) => row.count > 0);
  const recent = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const technicianNames = new Map(
    technicians.map((technician) => [technician.id, technician.name]),
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Operations overview"
        description="Dispatch health, commercial signals and the queues that need a human decision. Every figure below is simulated demo data."
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <DemoTag />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-secondary">
              <CalendarDays aria-hidden="true" className="size-3.5 text-ink-muted" />
              {period}
            </span>
          </div>
        }
      />

      <Notice tone="info" className="py-3 text-[12.5px]">
        <strong>Illustrative only.</strong> Booking value, commission and
        resolution outcomes are generated from the local demo store. No real
        payments, customers or technicians are involved.
      </Notice>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Booking volume"
          value={inRange.length}
          detail={`${completed.length} completed · ${activeInRange} active in period`}
          icon={CalendarDays}
          href="/admin/bookings"
        />
        <KpiCard
          label="Gross booking value"
          value={formatINR(Math.round(gbv))}
          detail={`${completed.length} completed demo jobs`}
          icon={IndianRupee}
          tone="success"
          href="/admin/bookings?status=completed"
          illustrative
        />
        <KpiCard
          label="Demo commission"
          value={formatINR(Math.round(commission))}
          detail={`${COMMISSION_PERCENT}% of completed demo value`}
          icon={IndianRupee}
          tone="accent"
          illustrative
        />
        <KpiCard
          label="Pending approvals"
          value={pendingTechnicians.length}
          detail="Technician documents waiting"
          icon={ShieldCheck}
          tone="warning"
          href="/admin/technicians?status=pending"
        />
        <KpiCard
          label="Open disputes"
          value={openDisputes.length}
          detail={`${highPriority.length} high priority · ${pastSla.length} past SLA`}
          icon={Scale}
          tone="danger"
          href="/admin/disputes"
        />
      </div>

      <AdminSection
        id="exceptions"
        title="Operational exceptions"
        description="Queues that need attention before the routine charts."
        action={
          <Badge tone={openExceptions.length > 0 ? "warning" : "success"} dot>
            {openExceptions.length > 0
              ? `${openExceptions.length} queues need attention`
              : "All clear"}
          </Badge>
        }
      >
        {openExceptions.length > 0 ? (
          <ul className="divide-y divide-line">
            {openExceptions.map(({ id, title, detail, count, href, cta, Icon, tone }) => (
              <li
                key={id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
              >
                <span
                  className={
                    tone === "danger"
                      ? "grid size-9 shrink-0 place-items-center rounded-md bg-danger-soft text-danger"
                      : tone === "warning"
                        ? "grid size-9 shrink-0 place-items-center rounded-md bg-warning-soft text-warning"
                        : "grid size-9 shrink-0 place-items-center rounded-md bg-info-soft text-info"
                  }
                >
                  <Icon aria-hidden="true" className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink">
                    {title}{" "}
                    <span className="font-normal text-ink-muted">
                      ({count})
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                    {detail}
                  </p>
                </div>
                <Link
                  href={href}
                  className="inline-flex h-8 shrink-0 items-center gap-1 rounded-sm px-2 text-[12.5px] font-semibold text-brand hover:bg-brand-soft"
                >
                  {cta}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={ShieldCheck}
              title="No operational exceptions"
              description="Dispatch, disputes and verification queues are all clear in this demo state."
              compact
            />
          </div>
        )}
      </AdminSection>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <AdminSection
          id="recent"
          className="min-w-0"
          title="Recent bookings"
          description="Newest requests across the demo store."
          action={
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:text-brand-hover"
            >
              All bookings
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          }
        >
          {recent.length > 0 ? (
            <>
              <ul className="divide-y divide-line sm:hidden">
                {recent.map((booking) => (
                  <li key={booking.id}>
                    <Link
                      href={`/admin/bookings?booking=${booking.id}`}
                      className="block px-4 py-3 hover:bg-brand-subtle/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-brand">
                            {booking.reference}
                          </p>
                          <p className="truncate text-[11.5px] text-ink-muted">
                            {booking.serviceName}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[11px] text-ink-muted">
                        <span>{friendlyDate(booking.date)}</span>
                        <span>{formatSlot(booking.slot)}</span>
                        <span className="tabular-nums">
                          {formatINR(booking.estimate.total)}
                        </span>
                        <span>
                          {booking.technicianId
                            ? (technicianNames.get(booking.technicianId) ?? "Unknown")
                            : "Unassigned"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                    <th scope="col" className="px-4 py-2 font-semibold sm:px-5">
                      Booking
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Technician
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Visit
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold sm:px-5">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recent.map((booking) => (
                    <tr key={booking.id} className="hover:bg-brand-subtle/50">
                      <td className="px-4 py-2.5 sm:px-5">
                        <Link
                          href={`/admin/bookings?booking=${booking.id}`}
                          className="text-[12.5px] font-semibold text-brand hover:text-brand-hover"
                        >
                          {booking.reference}
                        </Link>
                        <p className="max-w-48 truncate text-[11.5px] text-ink-muted">
                          {booking.serviceName}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-[12.5px] text-ink-secondary">
                        {booking.technicianId
                          ? (technicianNames.get(booking.technicianId) ?? "Unknown")
                          : "Unassigned"}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-ink-secondary">
                        {friendlyDate(booking.date)}
                        <span className="block text-[11px] text-ink-muted">
                          {formatSlot(booking.slot)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-3 py-2.5 text-right text-[12.5px] font-medium tabular-nums text-ink sm:px-5">
                        {formatINR(booking.estimate.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          ) : (
            <div className="p-4">
              <EmptyState
                icon={Wrench}
                title="No bookings yet"
                description="New customer requests will appear here."
                compact
              />
            </div>
          )}
        </AdminSection>

        <div className="min-w-0 space-y-5">
          <AdminSection
            id="status-mix"
            title="Booking status mix"
            description="All bookings currently in the demo store."
          >
            <StatusMix bookings={bookings} />
          </AdminSection>

          <AdminSection
            id="queue"
            title="Priority cases"
            description="Highest-priority unresolved disputes."
            action={
              <Link
                href="/admin/disputes"
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:text-brand-hover"
              >
                Queue
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            }
          >
            {openDisputes.length > 0 ? (
              <ul className="divide-y divide-line">
                {[...openDisputes]
                  .sort(
                    (a, b) =>
                      disputeAgeHours(b.openedAt) - disputeAgeHours(a.openedAt),
                  )
                  .slice(0, 3)
                  .map((dispute) => (
                    <DisputeRow key={dispute.id} dispute={dispute} />
                  ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-[12.5px] text-ink-muted">
                No open disputes. Nice.
              </p>
            )}
          </AdminSection>
        </div>
      </div>
    </div>
  );
}

function StatusMix({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={TriangleAlert}
          title="No bookings"
          description="The status mix appears once the store has bookings."
          compact
        />
      </div>
    );
  }

  const counts = STATUS_ORDER.map((entry) => ({
    ...entry,
    count: bookings.filter((booking) => booking.status === entry.status).length,
  })).filter((entry) => entry.count > 0);

  return (
    <div className="px-4 py-4 sm:px-5">
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-[#f2f4f7]"
        role="img"
        aria-label={counts
          .map((entry) => `${entry.label}: ${entry.count}`)
          .join(", ")}
      >
        {counts.map((entry) => (
          <span
            key={entry.status}
            className={entry.bar}
            style={{ width: `${(entry.count / bookings.length) * 100}%` }}
            title={`${entry.label}: ${entry.count}`}
          />
        ))}
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-1">
        {counts.map((entry) => (
          <li
            key={entry.status}
            className="flex items-center justify-between gap-2 text-[12px]"
          >
            <span className="flex min-w-0 items-center gap-1.5 text-ink-secondary">
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${entry.bar}`}
              />
              <span className="truncate">{entry.label}</span>
            </span>
            <span className="tabular-nums text-ink-muted">
              {entry.count} · {Math.round((entry.count / bookings.length) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DisputeRow({ dispute }: { dispute: DisputeCase }) {
  const priority = disputePriorityMeta[dispute.priority];
  return (
    <li>
      <Link
        href={`/admin/disputes?case=${dispute.id}`}
        className="flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-brand-subtle/50 sm:px-5"
      >
        <Badge tone={priority.tone} dot className="mt-0.5 shrink-0">
          {priority.label}
        </Badge>
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-semibold text-ink">
            {dispute.reference}
          </span>
          <span className="block truncate text-[11.5px] text-ink-muted">
            {dispute.summary}
          </span>
        </span>
        <span className="shrink-0 text-[11.5px] tabular-nums text-ink-muted">
          {formatAge(disputeAgeHours(dispute.openedAt))}
        </span>
      </Link>
    </li>
  );
}
