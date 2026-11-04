"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { DEMO_PROFILE, getServiceBySlug } from "@/lib/mock-data";
import { formatDate, formatINR, formatSlot, formatTimestamp } from "@/lib/format";
import { isJobLocked } from "@/lib/job-workflow";
import { quoteTotal } from "@/lib/technician";
import type {
  Address,
  Booking,
  BookingStatus,
  PaymentPreference,
  TechnicianRecord,
  WorkQuote,
} from "@/lib/types";
import { Badge, StatusBadge, statusLabel } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import {
  AdminDrawer,
} from "./admin-drawer";
import {
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  AdminToast,
  DemoTag,
  adminField,
  adminSelect,
} from "./admin-ui";

const STATUSES: BookingStatus[] = [
  "requested",
  "assigned",
  "accepted",
  "on_the_way",
  "arrived",
  "in_progress",
  "awaiting_approval",
  "completed",
  "cancelled",
];

const PAYMENT_LABELS: Record<PaymentPreference, string> = {
  "pay-after-service": "Pay after service",
  "demo-upi": "Demo UPI",
  "demo-card": "Demo card",
};

type DateFilter = "all" | "today" | "upcoming" | "past";

function localDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function BookingsView() {
  const { bookings, addresses, technicians, jobWork, hydrated } = useDemoStore();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">(
    STATUSES.includes(initialStatus as BookingStatus)
      ? (initialStatus as BookingStatus)
      : "all",
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("booking"),
  );
  const [toast, setToast] = useState<string | null>(null);

  if (!hydrated) return <AdminPageSkeleton cards={3} />;

  const today = localDate();
  const technicianNames = new Map(
    technicians.map((technician) => [technician.id, technician.name]),
  );

  const filtered = bookings
    .filter((booking) => {
      if (status !== "all" && booking.status !== status) return false;
      if (dateFilter === "today" && booking.date !== today) return false;
      if (dateFilter === "upcoming" && booking.date < today) return false;
      if (dateFilter === "past" && booking.date >= today) return false;

      if (!query.trim()) return true;
      const needle = query.trim().toLowerCase();
      const haystack = [
        booking.reference,
        booking.serviceName,
        booking.status,
        statusLabel(booking.status),
        DEMO_PROFILE.name,
        booking.technicianId
          ? (technicianNames.get(booking.technicianId) ?? "")
          : "unassigned",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const selected = bookings.find((booking) => booking.id === selectedId) ?? null;
  const hasFilters = Boolean(query) || status !== "all" || dateFilter !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setDateFilter("all");
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Bookings"
        description="Search every demo booking, inspect the visit record and simulate dispatch decisions. Customer-facing timelines update with each operations action."
        aside={<DemoTag />}
      />

      <AdminSection
        id="bookings"
        title="Booking operations"
        description={`${filtered.length} of ${bookings.length} demo bookings shown`}
        action={
          hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:text-brand-hover"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear filters
            </button>
          ) : null
        }
      >
        <div className="grid gap-2.5 border-b border-line bg-canvas/40 px-4 py-3 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1fr)_190px_170px]">
          <label className="relative block">
            <span className="sr-only">Search bookings</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Reference, service, customer, technician or status"
              className={`${adminField} pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as BookingStatus | "all")
              }
              className={adminSelect}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((entry) => (
                <option key={entry} value={entry}>
                  {statusLabel(entry)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by visit date</span>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              className={adminSelect}
            >
              <option value="all">All visit dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past visits</option>
            </select>
          </label>
        </div>

        {filtered.length > 0 ? (
          <>
            <ul className="divide-y divide-line lg:hidden">
              {filtered.map((booking) => {
                const technicianName = booking.technicianId
                  ? technicianNames.get(booking.technicianId)
                  : null;
                return (
                  <li key={booking.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(booking.id)}
                      className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-brand-subtle/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-brand">
                            {booking.reference}
                          </p>
                          <p className="truncate text-[11.5px] text-ink-muted">
                            {booking.serviceName}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[11.5px]">
                        <div>
                          <dt className="text-ink-muted">Visit</dt>
                          <dd className="text-ink-secondary">
                            {formatDate(booking.date)} · {" "}
                            {formatSlot(booking.slot)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ink-muted">Value</dt>
                          <dd className="font-medium tabular-nums text-ink">
                            {formatINR(booking.estimate.total)}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-ink-muted">Technician</dt>
                          <dd className="text-ink-secondary">
                            {technicianName ?? "Unassigned"}
                          </dd>
                        </div>
                      </dl>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                  <th scope="col" className="px-4 py-2.5 font-semibold sm:px-5">
                    Booking
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Customer
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Technician
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Visit
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Value
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold sm:px-5">
                    <span className="sr-only">Open booking</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((booking) => {
                  const technicianName = booking.technicianId
                    ? technicianNames.get(booking.technicianId)
                    : null;
                  return (
                    <tr key={booking.id} className="hover:bg-brand-subtle/40">
                      <td className="px-4 py-3 sm:px-5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(booking.id)}
                          className="text-left text-[12.5px] font-semibold text-brand hover:text-brand-hover"
                        >
                          {booking.reference}
                        </button>
                        <p className="max-w-56 truncate text-[11.5px] text-ink-muted">
                          {booking.serviceName}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[12.5px] text-ink-secondary">
                        {DEMO_PROFILE.name}
                        <span className="block text-[11px] text-ink-muted">
                          Demo customer
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12.5px]">
                        {technicianName ? (
                          <span className="text-ink-secondary">
                            {technicianName}
                          </span>
                        ) : (
                          <Badge tone="warning" dot>
                            Unassigned
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-secondary">
                        {formatDate(booking.date)}
                        <span className="block text-[11px] text-ink-muted">
                          {formatSlot(booking.slot)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12.5px] font-medium tabular-nums text-ink">
                        {formatINR(booking.estimate.total)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(booking.id)}
                          className="text-[12px] font-semibold text-brand hover:text-brand-hover"
                        >
                          Open
                          <span className="sr-only"> {booking.reference}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Search}
              title="No bookings match these filters"
              description="Try a different reference, technician or date range. Filters only search the local demo store."
              action={
                hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
              compact
            />
          </div>
        )}
      </AdminSection>

      {selected ? (
        <BookingDrawer
          key={selected.id}
          booking={selected}
          address={addresses.find((entry) => entry.id === selected.addressId)}
          technicians={technicians}
          quote={jobWork[selected.id]?.quote}
          onClose={() => setSelectedId(null)}
          notify={setToast}
        />
      ) : null}

      <AdminToast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function BookingDrawer({
  booking,
  address,
  technicians,
  quote,
  onClose,
  notify,
}: {
  booking: Booking;
  address?: Address;
  technicians: TechnicianRecord[];
  quote?: WorkQuote;
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const { assignBookingTechnician, adminCancelBooking, adminCompleteBooking } =
    useDemoStore();
  const [technicianId, setTechnicianId] = useState(booking.technicianId ?? "");
  const [cancelReason, setCancelReason] = useState("");
  const [confirm, setConfirm] = useState<"cancel" | "complete" | null>(null);

  const verified = technicians.filter(
    (technician) => technician.verification === "verified",
  );
  const currentTechnician = technicians.find(
    (technician) => technician.id === booking.technicianId,
  );
  const locked = isJobLocked(booking.status);
  const canComplete =
    booking.status === "in_progress" || booking.status === "awaiting_approval";
  const canCancel = !locked;
  const assignmentChanged =
    technicianId.length > 0 && technicianId !== (booking.technicianId ?? "");
  const service = getServiceBySlug(booking.serviceSlug);

  return (
    <AdminDrawer
      open
      onClose={onClose}
      title={`Booking ${booking.reference}`}
      subtitle={`${booking.serviceName} · ${formatDate(booking.date)} · ${formatSlot(booking.slot)}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11.5px] text-ink-muted">
            All actions are simulated and update the local demo store.
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={booking.status} />
          <Badge tone="neutral">{PAYMENT_LABELS[booking.paymentPreference]}</Badge>
          <span className="text-[11.5px] text-ink-muted">
            Created {formatTimestamp(booking.createdAt)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-line p-3.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              <UserRound aria-hidden="true" className="size-3.5" />
              Customer
            </p>
            <p className="mt-1.5 text-[13.5px] font-medium text-ink">
              {DEMO_PROFILE.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-muted">
              <Phone aria-hidden="true" className="size-3" />
              {DEMO_PROFILE.phone}
            </p>
            <p className="text-[12px] text-ink-muted">{DEMO_PROFILE.email}</p>
          </div>
          <div className="rounded-md border border-line p-3.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              <MapPin aria-hidden="true" className="size-3.5" />
              Visit address
            </p>
            {address ? (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <span className="block">
                  {address.city} {address.pincode}
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  {address.label} · demo address
                </span>
              </p>
            ) : (
              <p className="mt-1.5 text-[12.5px] text-ink-muted">
                Address not in the demo store.
              </p>
            )}
          </div>
        </div>

        <section aria-labelledby="ops-pricing">
          <h3
            id="ops-pricing"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"
          >
            <ReceiptText aria-hidden="true" className="size-4 text-ink-muted" />
            Pricing snapshot
          </h3>
          <div className="mt-2 rounded-md border border-line">
            <ul className="divide-y divide-line">
              {booking.estimate.lines.map((line) => (
                <li
                  key={line.label}
                  className="flex items-baseline justify-between gap-3 px-3.5 py-2 text-[12.5px]"
                >
                  <span className="text-ink-secondary">{line.label}</span>
                  <span className="tabular-nums text-ink">
                    {formatINR(line.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between gap-3 border-t border-line bg-canvas/50 px-3.5 py-2.5">
              <span className="text-[12.5px] font-semibold text-ink">
                Estimated total
              </span>
              <span className="text-[14px] font-semibold tabular-nums text-ink">
                {formatINR(booking.estimate.total)}
              </span>
            </div>
          </div>
          {service ? (
            <p className="mt-1.5 text-[11.5px] text-ink-muted">
              From {formatINR(service.startPrice)} · price confirmed after
              inspection · {service.durationMins} min demo visit
            </p>
          ) : null}

          {quote ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-canvas/40 px-3.5 py-2.5">
              <div>
                <p className="text-[12px] font-medium text-ink">
                  Extra-work quote ·{" "}
                  <span className="font-semibold">
                    {formatINR(quoteTotal(quote))}
                  </span>
                </p>
                <p className="text-[11px] text-ink-muted">
                  Sent {formatTimestamp(quote.submittedAt)}
                </p>
              </div>
              <Badge
                tone={
                  quote.status === "approved"
                    ? "success"
                    : quote.status === "declined"
                      ? "neutral"
                      : "warning"
                }
                dot
              >
                {quote.status === "approved"
                  ? "Approved"
                  : quote.status === "declined"
                    ? "Declined"
                    : "Awaiting customer"}
              </Badge>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="ops-timeline">
          <h3
            id="ops-timeline"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"
          >
            <CalendarDays aria-hidden="true" className="size-4 text-ink-muted" />
            Visit timeline
          </h3>
          <ol className="mt-2 space-y-2.5 border-l border-line pl-4">
            {booking.timeline.map((step) => (
              <li key={`${step.status}-${step.at ?? "future"}`} className="relative">
                <span
                  aria-hidden="true"
                  className={
                    step.at
                      ? "absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-surface bg-brand"
                      : "absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-surface bg-line-strong"
                  }
                />
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="text-[12.5px] font-medium text-ink">
                    {statusLabel(step.status)}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {step.at ? formatTimestamp(step.at) : "Not reached"}
                  </p>
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                  {step.note}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="ops-dispatch" className="space-y-2.5">
          <h3 id="ops-dispatch" className="text-[13px] font-semibold text-ink">
            Dispatch
          </h3>
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Only verified technicians can be assigned. Changing the technician
            updates the customer booking and the technician portal.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Assign technician</span>
              <select
                value={technicianId}
                onChange={(event) => setTechnicianId(event.target.value)}
                disabled={locked}
                className={adminSelect}
              >
                <option value="">Choose a verified technician</option>
                {verified.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} · {technician.coverage[0]}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="sm"
              disabled={!assignmentChanged || locked}
              onClick={() => {
                if (!technicianId) return;
                const ok = assignBookingTechnician(booking.id, technicianId);
                notify(
                  ok
                    ? `${booking.reference} assigned to ${
                        technicians.find((entry) => entry.id === technicianId)
                          ?.name ?? "technician"
                      }.`
                    : "Assignment could not be changed. Check the booking state.",
                );
              }}
            >
              {booking.technicianId ? "Reassign" : "Assign"}
            </Button>
          </div>
          <p className="text-[11.5px] text-ink-muted">
            Current technician:{" "}
            <span className="font-medium text-ink-secondary">
              {currentTechnician?.name ?? "Unassigned"}
            </span>
            {currentTechnician ? ` · ${currentTechnician.phone}` : ""}
          </p>
        </section>

        <section
          aria-labelledby="ops-actions"
          className="rounded-md border border-line bg-canvas/40 p-3.5"
        >
          <h3 id="ops-actions" className="text-[13px] font-semibold text-ink">
            Operations actions
          </h3>
          {locked ? (
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
              This booking is {booking.status}. Closed bookings cannot be
              reassigned or changed.
            </p>
          ) : (
            <>
              {canComplete ? (
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] text-ink-secondary">
                    Close the visit without waiting for the technician
                    checklist.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirm("complete")}
                  >
                    Mark completed
                  </Button>
                </div>
              ) : null}

              {canCancel ? (
                <div className="mt-3 border-t border-line pt-3">
                  <label
                    htmlFor="cancel-reason"
                    className="text-[12px] font-medium text-ink-secondary"
                  >
                    Cancellation reason (shown to the customer)
                  </label>
                  <textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    rows={2}
                    placeholder="e.g. Customer asked to cancel before dispatch"
                    className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={!cancelReason.trim()}
                      onClick={() => setConfirm("cancel")}
                    >
                      Cancel booking
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <Notice tone="info" className="py-2.5 text-[11.5px]">
          Reference {booking.reference} lives only in this browser&apos;s demo
          store. No message or payment is sent.
        </Notice>
      </div>

      <ConfirmDialog
        open={confirm === "cancel"}
        title={`Cancel ${booking.reference}?`}
        description={`This moves the booking to cancelled, adds the reason to the customer timeline and sends a demo notification. Reason: "${cancelReason.trim() || "No reason"}"`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const ok = adminCancelBooking(booking.id, cancelReason);
          setConfirm(null);
          notify(
            ok
              ? `${booking.reference} cancelled and the customer timeline updated.`
              : "This booking could not be cancelled.",
          );
        }}
      />

      <ConfirmDialog
        open={confirm === "complete"}
        title={`Mark ${booking.reference} completed?`}
        description="This closes the visit from operations even if the technician checklist is incomplete. The customer timeline and notifications update immediately."
        confirmLabel="Mark completed"
        cancelLabel="Keep open"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const ok = adminCompleteBooking(booking.id);
          setConfirm(null);
          notify(
            ok
              ? `${booking.reference} marked completed.`
              : "This booking cannot be completed from its current state.",
          );
        }}
      />
    </AdminDrawer>
  );
}
