"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Lock,
  MessageSquare,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import {
  ADMIN_TEAM,
  PRIORITY_WEIGHT,
  disputeAgeHours,
  disputeKindLabel,
  disputePriorityMeta,
  disputeStatusMeta,
  formatAge,
} from "@/lib/admin";
import { formatDate, formatTimestamp } from "@/lib/format";
import type { DisputeCase, DisputePriority, DisputeStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { AdminDrawer } from "./admin-drawer";
import {
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  AdminToast,
  DemoTag,
  adminField,
  adminSelect,
} from "./admin-ui";

type PriorityFilter = "all" | DisputePriority;
type StatusFilter = "all" | DisputeStatus;
type OwnerFilter = "all" | "unassigned" | string;

export function DisputesView() {
  const { disputes, bookings, hydrated } = useDemoStore();
  const searchParams = useSearchParams();
  const initialPriority = searchParams.get("priority");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>(
    initialPriority === "high" ||
      initialPriority === "medium" ||
      initialPriority === "low"
      ? initialPriority
      : "all",
  );
  const [status, setStatus] = useState<StatusFilter>("all");
  const [owner, setOwner] = useState<OwnerFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("case"),
  );
  const [toast, setToast] = useState<string | null>(null);

  if (!hydrated) return <AdminPageSkeleton cards={3} />;

  const bookingRefs = new Map(
    bookings.map((booking) => [booking.id, booking.reference]),
  );

  const filtered = disputes
    .filter((dispute) => {
      if (priority !== "all" && dispute.priority !== priority) return false;
      if (status !== "all" && dispute.status !== status) return false;
      if (owner === "unassigned" && dispute.owner !== null) return false;
      if (
        owner !== "all" &&
        owner !== "unassigned" &&
        dispute.owner !== owner
      ) {
        return false;
      }
      if (!query.trim()) return true;
      const needle = query.trim().toLowerCase();
      return [
        dispute.reference,
        dispute.summary,
        dispute.kind,
        disputeKindLabel[dispute.kind],
        dispute.owner ?? "unassigned",
        bookingRefs.get(dispute.bookingId) ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => {
      const resolvedOrder =
        Number(a.status === "resolved") - Number(b.status === "resolved");
      if (resolvedOrder !== 0) return resolvedOrder;
      const priorityOrder =
        PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (priorityOrder !== 0) return priorityOrder;
      return (
        disputeAgeHours(b.openedAt) - disputeAgeHours(a.openedAt)
      );
    });

  const selected =
    disputes.find((dispute) => dispute.id === selectedId) ?? null;
  const openHigh = disputes.filter(
    (dispute) => dispute.priority === "high" && dispute.status !== "resolved",
  ).length;
  const pastSla = disputes.filter(
    (dispute) =>
      dispute.status !== "resolved" &&
      disputeAgeHours(dispute.openedAt) > dispute.slaHours,
  ).length;
  const hasFilters =
    Boolean(query) || priority !== "all" || status !== "all" || owner !== "all";

  function clearFilters() {
    setQuery("");
    setPriority("all");
    setStatus("all");
    setOwner("all");
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Disputes"
        description="A priority queue for unresolved support cases. Internal notes stay inside operations; only customer updates and the final resolution are customer-visible."
        aside={
          <div className="flex flex-wrap items-center gap-2">
            {openHigh > 0 ? (
              <Badge tone="danger" dot>
                {openHigh} high priority open
              </Badge>
            ) : null}
            {pastSla > 0 ? (
              <Badge tone="warning" dot>
                {pastSla} past SLA
              </Badge>
            ) : null}
            <DemoTag />
          </div>
        }
      />

      <AdminSection
        id="disputes"
        title="Priority queue"
        description={`${filtered.length} of ${disputes.length} demo cases · highest priority and oldest first`}
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
        <div className="grid gap-2.5 border-b border-line bg-canvas/40 px-4 py-3 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1fr)_150px_160px_170px]">
          <label className="relative block">
            <span className="sr-only">Search disputes</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Case, summary, booking, owner or type"
              className={`${adminField} pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as PriorityFilter)
              }
              className={adminSelect}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className={adminSelect}
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by owner</span>
            <select
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              className={adminSelect}
            >
              <option value="all">All owners</option>
              <option value="unassigned">Unassigned</option>
              {ADMIN_TEAM.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length > 0 ? (
          <>
            <ul className="divide-y divide-line lg:hidden">
              {filtered.map((dispute) => {
                const priorityMeta = disputePriorityMeta[dispute.priority];
                const statusMeta = disputeStatusMeta[dispute.status];
                const age = disputeAgeHours(dispute.openedAt);
                const overdue =
                  dispute.status !== "resolved" && age > dispute.slaHours;
                return (
                  <li key={dispute.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(dispute.id)}
                      className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-brand-subtle/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-brand">
                            {dispute.reference}
                          </p>
                          <p className="truncate text-[11.5px] text-ink-muted">
                            {dispute.summary}
                          </p>
                        </div>
                        <Badge tone={priorityMeta.tone} dot>
                          {priorityMeta.label}
                        </Badge>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-ink-secondary">
                        <Badge tone={statusMeta.tone} dot>
                          {statusMeta.label}
                        </Badge>
                        <span>{disputeKindLabel[dispute.kind]}</span>
                        <span>{dispute.owner ?? "Unassigned"}</span>
                        <span className={overdue ? "font-semibold text-danger" : ""}>
                          {formatAge(age)} ·{" "}
                          {overdue
                            ? `past ${dispute.slaHours}h SLA`
                            : `${dispute.slaHours}h target`}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[940px] text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                  <th scope="col" className="px-4 py-2.5 font-semibold sm:px-5">
                    Case
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Priority
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Booking
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Age / SLA
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Owner
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold sm:px-5">
                    <span className="sr-only">Open case</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((dispute) => {
                  const priorityMeta = disputePriorityMeta[dispute.priority];
                  const statusMeta = disputeStatusMeta[dispute.status];
                  const age = disputeAgeHours(dispute.openedAt);
                  const overdue =
                    dispute.status !== "resolved" && age > dispute.slaHours;
                  return (
                    <tr
                      key={dispute.id}
                      className="hover:bg-brand-subtle/40"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(dispute.id)}
                          className="text-left text-[12.5px] font-semibold text-brand hover:text-brand-hover"
                        >
                          {dispute.reference}
                        </button>
                        <p className="max-w-64 truncate text-[11.5px] text-ink-muted">
                          {dispute.summary}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={priorityMeta.tone} dot>
                          {priorityMeta.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-secondary">
                        {disputeKindLabel[dispute.kind]}
                      </td>
                      <td className="px-3 py-3 text-[12px]">
                        <Link
                          href={`/admin/bookings?booking=${dispute.bookingId}`}
                          className="font-medium text-brand hover:text-brand-hover"
                        >
                          {bookingRefs.get(dispute.bookingId) ??
                            dispute.bookingId}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-secondary">
                        <span className={overdue ? "font-semibold text-danger" : ""}>
                          {formatAge(age)}
                        </span>
                        <span className="block text-[11px] text-ink-muted">
                          {overdue
                            ? `Past ${dispute.slaHours}h SLA`
                            : `${dispute.slaHours}h target`}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-secondary">
                        {dispute.owner ?? (
                          <span className="text-ink-muted">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={statusMeta.tone} dot>
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(dispute.id)}
                          className="text-[12px] font-semibold text-brand hover:text-brand-hover"
                        >
                          Open
                          <span className="sr-only"> {dispute.reference}</span>
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
              title="No cases match these filters"
              description="Try another priority, status or owner. The queue only contains local demo cases."
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
        <DisputeDrawer
          key={selected.id}
          dispute={selected}
          onClose={() => setSelectedId(null)}
          notify={setToast}
        />
      ) : null}

      <AdminToast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function DisputeDrawer({
  dispute,
  onClose,
  notify,
}: {
  dispute: DisputeCase;
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const {
    bookings,
    assignDisputeOwner,
    addDisputeInternalNote,
    startDisputeInvestigation,
    resolveDispute,
  } = useDemoStore();
  const [owner, setOwner] = useState(dispute.owner ?? "");
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState("");
  const [confirmResolve, setConfirmResolve] = useState(false);

  const booking = bookings.find((entry) => entry.id === dispute.bookingId);
  const priorityMeta = disputePriorityMeta[dispute.priority];
  const statusMeta = disputeStatusMeta[dispute.status];
  const age = disputeAgeHours(dispute.openedAt);
  const overdue = dispute.status !== "resolved" && age > dispute.slaHours;
  const resolved = dispute.status === "resolved";

  return (
    <AdminDrawer
      open
      onClose={onClose}
      title={`Case ${dispute.reference}`}
      subtitle={`${disputeKindLabel[dispute.kind]} · opened ${formatTimestamp(
        dispute.openedAt,
      )}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11.5px] text-ink-muted">
            Internal notes never appear in customer notifications.
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={priorityMeta.tone} dot>
            {priorityMeta.label} priority
          </Badge>
          <Badge tone={statusMeta.tone} dot>
            {statusMeta.label}
          </Badge>
          <Badge tone={overdue ? "danger" : "neutral"}>
            {formatAge(age)} old · {overdue ? "past SLA" : `${dispute.slaHours}h SLA`}
          </Badge>
        </div>

        <div className="rounded-md border border-line bg-canvas/40 p-3.5">
          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
            <ShieldAlert aria-hidden="true" className="size-3.5" />
            Customer summary
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
            {dispute.summary}
          </p>
          <div className="mt-3 grid gap-2 border-t border-line pt-2.5 text-[12px] sm:grid-cols-2">
            <p className="text-ink-muted">
              Linked booking:{" "}
              <Link
                href={`/admin/bookings?booking=${dispute.bookingId}`}
                className="font-medium text-brand hover:text-brand-hover"
              >
                {booking?.reference ?? dispute.bookingId}
              </Link>
            </p>
            <p className="text-ink-muted">
              Visit:{" "}
              <span className="text-ink-secondary">
                {booking ? formatDate(booking.date) : "Not in store"}
              </span>
            </p>
          </div>
        </div>

        <section aria-labelledby="owner-heading">
          <h3 id="owner-heading" className="text-[13px] font-semibold text-ink">
            Case owner
          </h3>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Assign case owner</span>
              <select
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                className={adminSelect}
              >
                <option value="">Unassigned</option>
                {ADMIN_TEAM.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="secondary"
              size="sm"
              disabled={(dispute.owner ?? "") === owner}
              onClick={() => {
                const nextOwner = owner || null;
                const ok = assignDisputeOwner(dispute.id, nextOwner);
                notify(
                  ok
                    ? nextOwner
                      ? `${dispute.reference} assigned to ${nextOwner}.`
                      : `${dispute.reference} is now unassigned.`
                    : "Owner could not be changed.",
                );
              }}
            >
              Save owner
            </Button>
          </div>
          <p className="mt-1 text-[11.5px] text-ink-muted">
            Assignment is internal and sends no customer notification.
          </p>
        </section>

        <section aria-labelledby="evidence-heading">
          <h3
            id="evidence-heading"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"
          >
            <FileText aria-hidden="true" className="size-4 text-ink-muted" />
            Evidence placeholders
          </h3>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {dispute.evidence.map((item) => (
              <li
                key={item}
                className="rounded-sm border border-line bg-canvas/40 px-2 py-1 text-[11.5px] text-ink-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-ink-muted">
            Placeholder references only — no attachments are stored.
          </p>
        </section>

        {/* Internal notes are deliberately isolated from customer content. */}
        <section
          aria-labelledby="internal-notes-heading"
          className="rounded-lg border border-[#efcf9a] bg-warning-soft/50"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#efcf9a] px-3.5 py-2.5">
            <h3
              id="internal-notes-heading"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6b3a00]"
            >
              <Lock aria-hidden="true" className="size-4" />
              Internal notes
            </h3>
            <span className="rounded-sm bg-[#6b3a00] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              Admin only · never shown to customer
            </span>
          </div>
          <div className="px-3.5 py-3">
            <label
              htmlFor="internal-note"
              className="text-[12px] font-medium text-[#6b3a00]"
            >
              Add an internal note
            </label>
            <textarea
              id="internal-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Private operations context, hypotheses or next steps…"
              className="mt-1.5 w-full rounded-md border border-[#efcf9a] bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink outline-none focus:border-warning focus:ring-2 focus:ring-warning/20"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[11px] text-[#6b3a00]/80">
                Never copied into customer updates or notifications.
              </p>
              <Button
                size="sm"
                disabled={!note.trim()}
                onClick={() => {
                  const ok = addDisputeInternalNote(dispute.id, note);
                  if (ok) setNote("");
                  notify(
                    ok
                      ? "Internal note added. It stays in the operations view."
                      : "The note could not be added.",
                  );
                }}
              >
                Add note
              </Button>
            </div>

            {dispute.internalNotes.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t border-[#efcf9a] pt-3">
                {dispute.internalNotes.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md border border-[#efcf9a] bg-surface px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#6b3a00]">
                        <Lock aria-hidden="true" className="size-3" />
                        {entry.author}
                      </p>
                      <p className="text-[10.5px] text-ink-muted">
                        {formatTimestamp(entry.at)}
                      </p>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
                      {entry.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-t border-[#efcf9a] pt-3 text-[12px] text-ink-muted">
                No internal notes yet.
              </p>
            )}
          </div>
        </section>

        {/* Customer-visible content: updates and resolution only. */}
        <section
          aria-labelledby="customer-updates-heading"
          className="rounded-lg border border-line bg-surface"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
            <h3
              id="customer-updates-heading"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"
            >
              <UserRound aria-hidden="true" className="size-4 text-brand" />
              Customer-visible updates
            </h3>
            <Badge tone="brand" dot>
              Customer can see this
            </Badge>
          </div>
          <div className="px-3.5 py-3">
            {dispute.customerUpdates.length > 0 ? (
              <ul className="space-y-2">
                {dispute.customerUpdates.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md border border-line bg-brand-subtle/40 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-secondary">
                        <MessageSquare aria-hidden="true" className="size-3" />
                        {entry.author}
                      </p>
                      <p className="text-[10.5px] text-ink-muted">
                        {formatTimestamp(entry.at)}
                      </p>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
                      {entry.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-ink-muted">
                No customer-visible updates yet.
              </p>
            )}

            {resolved ? (
              <div className="mt-3 rounded-md border border-[#c7e8d5] bg-success-soft p-3">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0f5c34]">
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                  Resolved
                  {dispute.resolvedAt
                    ? ` · ${formatTimestamp(dispute.resolvedAt)}`
                    : ""}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#0f5c34]">
                  {dispute.resolution}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {!resolved ? (
          <section
            aria-labelledby="resolution-heading"
            className="rounded-md border border-line bg-canvas/40 p-3.5"
          >
            <h3
              id="resolution-heading"
              className="text-[13px] font-semibold text-ink"
            >
              Resolution flow
            </h3>
            {dispute.status === "open" ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12px] leading-relaxed text-ink-secondary">
                  Start an investigation to add a customer-visible holding
                  update.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = startDisputeInvestigation(dispute.id);
                    notify(
                      ok
                        ? "Investigation started and a customer update added."
                        : "Case status could not be changed.",
                    );
                  }}
                >
                  Start investigation
                </Button>
              </div>
            ) : null}

            <label
              htmlFor="resolution"
              className="mt-3 block text-[12px] font-medium text-ink-secondary"
            >
              Customer-facing resolution
            </label>
            <p className="text-[11px] text-ink-muted">
              This exact text is added to customer updates and the notification.
              Never include internal notes here.
            </p>
            <textarea
              id="resolution"
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
              rows={3}
              placeholder="What was agreed, what changed, and what the customer should expect next…"
              className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                disabled={!resolution.trim()}
                onClick={() => setConfirmResolve(true)}
              >
                Resolve case
              </Button>
            </div>
          </section>
        ) : null}

        <Notice tone="info" className="py-2.5 text-[11.5px]">
          Resolution sends a demo customer notification. Internal notes remain
          visible only on this operations screen.
        </Notice>
      </div>

      <ConfirmDialog
        open={confirmResolve}
        title={`Resolve ${dispute.reference}?`}
        description={`This marks the case resolved and sends the customer-visible text below as an update and notification. Internal notes are not included. Resolution: "${resolution.trim() || "No resolution"}"`}
        confirmLabel="Resolve and notify"
        cancelLabel="Keep investigating"
        onCancel={() => setConfirmResolve(false)}
        onConfirm={() => {
          const ok = resolveDispute(dispute.id, resolution);
          setConfirmResolve(false);
          notify(
            ok
              ? `${dispute.reference} resolved. Customer update and notification created.`
              : "The case could not be resolved.",
          );
        }}
      />
    </AdminDrawer>
  );
}
