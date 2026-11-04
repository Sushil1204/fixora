"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock,
  ImagePlus,
  MapPin,
  Navigation,
  Package,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { getServiceBySlug } from "@/lib/mock-data";
import {
  formatDate,
  formatDuration,
  formatINR,
  formatSlot,
  formatTimestamp,
} from "@/lib/format";
import {
  NEXT_JOB_ACTION,
  isJobLocked,
} from "@/lib/job-workflow";
import {
  EVIDENCE_SLOTS,
  belongsToTechnician,
  buildChecklist,
  computeEarnings,
  demoDistance,
  jobGross,
  jobPayout,
  quoteTotal,
} from "@/lib/technician";
import { Badge, StatusBadge, statusLabel } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { TextAreaField, TextField } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import type { BookingStatus, JobChecklistItem } from "@/lib/types";

const PROGRESS_STEPS: BookingStatus[] = [
  "assigned",
  "accepted",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
];

interface QuoteDraftRow {
  key: number;
  description: string;
  amount: string;
}

let draftKey = 0;
const blankRow = (): QuoteDraftRow => ({
  key: draftKey++,
  description: "",
  amount: "",
});

function ChecklistGroup({
  title,
  items,
  done,
  locked,
  onToggle,
}: {
  title: string;
  items: JobChecklistItem[];
  done: string[];
  locked: boolean;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const completed = items.filter((item) => done.includes(item.id)).length;

  return (
    <fieldset disabled={locked} className="min-w-0">
      <legend className="flex w-full items-baseline justify-between gap-2 text-[13px] font-semibold text-ink">
        {title}
        <span className="text-[11.5px] font-medium tabular-nums text-ink-muted">
          {completed} of {items.length}
        </span>
      </legend>
      <ul className="mt-2 space-y-2">
        {items.map((item) => {
          const checked = done.includes(item.id);
          return (
            <li key={item.id}>
              <label
                className={cn(
                  "flex min-h-12 items-start gap-3 rounded-md border px-3 py-2.5 transition-colors",
                  locked ? "cursor-default" : "cursor-pointer",
                  checked
                    ? "border-brand/30 bg-brand-subtle"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onToggle(item.id, event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-brand"
                />
                <span
                  className={cn(
                    "text-[13.5px] leading-relaxed",
                    checked ? "text-ink-secondary" : "text-ink",
                  )}
                >
                  {item.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function JobDetail({ jobId }: { jobId: string }) {
  const {
    bookings,
    addresses,
    profile,
    jobWork,
    hydrated,
    transitionJob,
    submitWorkQuote,
    setJobChecklistItem,
    attachJobEvidence,
    saveJobNotes,
  } = useDemoStore();

  const [routeOpen, setRouteOpen] = useState(false);
  const [quoteRows, setQuoteRows] = useState<QuoteDraftRow[]>([blankRow()]);
  const [quoteNote, setQuoteNote] = useState("");
  const [quoteError, setQuoteError] = useState("");
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const [notesSaved, setNotesSaved] = useState(false);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const booking = bookings.find((entry) => entry.id === jobId);

  if (!booking) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Job not found"
        description="This job isn't in the demo store. It may belong to a reset demo, or the link is from an older browser session."
        action={
          <Link href="/technician" className={buttonStyles({ size: "md" })}>
            Back to jobs
          </Link>
        }
      />
    );
  }

  if (!belongsToTechnician(booking)) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Not assigned to you"
        description="Operations assigned this job to another technician. It is hidden from your demo queue."
        action={
          <Link href="/technician" className={buttonStyles({ size: "md" })}>
            Back to jobs
          </Link>
        }
      />
    );
  }

  const work = jobWork[booking.id] ?? { done: [], evidence: {}, notes: "" };
  const checklist = buildChecklist(booking.categoryId);
  const doneCount = checklist.filter((item) => work.done.includes(item.id)).length;
  const remaining = checklist.length - doneCount;
  const locked = isJobLocked(booking.status);
  const address = addresses.find((entry) => entry.id === booking.addressId);
  const service = getServiceBySlug(booking.serviceSlug);
  const distance = demoDistance(booking);
  const gross = jobGross(booking, work);
  const payout = jobPayout(booking, work);
  const commission = gross - payout;
  const quote = work.quote;
  const quotePending = quote?.status === "pending";
  const quoteEditorOpen =
    !locked &&
    !quotePending &&
    quote?.status !== "approved" &&
    (booking.status === "in_progress" || booking.status === "awaiting_approval");

  const next =
    booking.status === "requested"
      ? {
          status: "accepted" as BookingStatus,
          label: "Accept job",
          helper: "Assign this request to yourself in the demo.",
        }
      : NEXT_JOB_ACTION[booking.status];

  const blockedByChecklist =
    next?.status === "completed" && remaining > 0;

  // Awaiting approval sits inside "in progress", so the bar stops at step 5.
  const progressIndex =
    booking.status === "awaiting_approval"
      ? 4
      : PROGRESS_STEPS.indexOf(booking.status);
  const progressPercent =
    locked && booking.status === "completed"
      ? 100
      : Math.max(0, ((progressIndex + 1) / PROGRESS_STEPS.length) * 100);

  const reached = booking.timeline.filter((step) => step.at);
  const notesValue = notesDraft ?? work.notes;
  const notesDirty = notesDraft !== null && notesDraft !== work.notes;
  const earnings = computeEarnings(bookings, jobWork);

  function handleTransition() {
    if (!next) return;
    transitionJob(booking!.id, next.status);
  }

  function updateRow(
    key: number,
    patch: Partial<Pick<QuoteDraftRow, "description" | "amount">>,
  ) {
    setQuoteRows((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
    setQuoteError("");
  }

  function handleQuoteSubmit(event: React.FormEvent) {
    event.preventDefault();
    const ok = submitWorkQuote(
      booking!.id,
      quoteRows.map((row) => ({
        description: row.description,
        amount: row.amount,
      })),
      quoteNote,
    );
    if (!ok) {
      setQuoteError(
        "Add at least one line item with a description and an amount above zero.",
      );
      return;
    }
    setQuoteRows([blankRow()]);
    setQuoteNote("");
    setQuoteError("");
  }

  return (
    <div>
      <nav aria-label="Breadcrumb">
        <Link
          href="/technician"
          className="inline-flex items-center gap-1.5 rounded-sm text-[13.5px] font-medium text-ink-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All jobs
        </Link>
      </nav>

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12.5px] font-medium tabular-nums text-ink-muted">
            {booking.reference}
          </p>
          <StatusBadge status={booking.status} />
        </div>
        <h1 className="mt-1 text-balance text-[24px] font-[680] leading-tight tracking-[-0.015em] text-ink sm:text-[30px]">
          {booking.serviceName}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="size-4 text-ink-muted" />
            {formatDate(booking.date)} · {formatSlot(booking.slot)}
          </span>
          {service ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden="true" className="size-4 text-ink-muted" />
              {formatDuration(service.durationMins)} estimated
            </span>
          ) : null}
        </p>
      </header>

      <div className="mt-4 space-y-3">
        {locked && booking.status === "completed" ? (
          <Notice tone="success" title="This job is complete">
            The checklist, photos and quote are now read-only. You can still add
            post-job notes.
          </Notice>
        ) : null}

        {booking.status === "cancelled" ? (
          <Notice tone="warning" title="This booking was cancelled">
            No visit will take place. Nothing is payable for a cancelled demo
            booking.
          </Notice>
        ) : null}

        {quotePending ? (
          <Notice tone="warning" title="Waiting on the customer">
            Your{" "}
            <strong>{formatINR(quote ? quoteTotal(quote) : 0)}</strong> quote is
            pending approval, so the job can&apos;t be completed yet.{" "}
            <Link
              href={`/bookings/${booking.id}`}
              className="font-semibold underline underline-offset-2"
            >
              Preview it in the customer view
            </Link>
            .
          </Notice>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-4">
          {/* Progress */}
          <section
            aria-labelledby="progress-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="progress-heading"
                className="text-[15px] font-semibold text-ink"
              >
                Job progress
              </h2>
              <p className="text-[12px] font-medium text-ink-muted">
                {booking.status === "awaiting_approval"
                  ? "Step 5 of 6 · approval"
                  : `Step ${Math.min(progressIndex + 1, 6)} of 6`}
              </p>
            </div>

            <div
              role="img"
              aria-label={`Job status: ${statusLabel(booking.status)}`}
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#eef1f6]"
            >
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-secondary">
              {next
                ? next.helper
                : quotePending
                  ? "The customer is reviewing your extra-work quote."
                  : locked
                    ? "All workflow actions are closed for this job."
                    : "Waiting for the next update."}
            </p>

            {reached.length > 0 ? (
              <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                {reached.slice(-3).map((step) => (
                  <li
                    key={`${step.status}-${step.at}`}
                    className="flex items-baseline justify-between gap-3 text-[12.5px]"
                  >
                    <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                      <Check
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-brand"
                      />
                      {statusLabel(step.status)}
                    </span>
                    <span className="tabular-nums text-ink-muted">
                      {step.at ? formatTimestamp(step.at) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {/* Checklist */}
          <section
            aria-labelledby="checklist-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="checklist-heading"
                className="flex items-center gap-2 text-[15px] font-semibold text-ink"
              >
                <Package aria-hidden="true" className="size-4 text-brand" />
                Job checklist
              </h2>
              <p className="text-[12px] font-medium tabular-nums text-ink-muted">
                {doneCount} of {checklist.length} done
              </p>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              Every item must be ticked before the job can be completed.
            </p>

            <div className="mt-4 space-y-5">
              <ChecklistGroup
                title="Before you start"
                items={checklist.filter((item) => item.phase === "pre")}
                done={work.done}
                locked={locked}
                onToggle={(id, checked) =>
                  setJobChecklistItem(booking.id, id, checked)
                }
              />
              <ChecklistGroup
                title="Before you leave"
                items={checklist.filter((item) => item.phase === "post")}
                done={work.done}
                locked={locked}
                onToggle={(id, checked) =>
                  setJobChecklistItem(booking.id, id, checked)
                }
              />
            </div>
          </section>

          {/* Evidence */}
          <section
            aria-labelledby="evidence-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="evidence-heading"
                className="flex items-center gap-2 text-[15px] font-semibold text-ink"
              >
                <Camera aria-hidden="true" className="size-4 text-brand" />
                Photo evidence
              </h2>
              <p className="text-[12px] font-medium text-ink-muted">
                Simulated
              </p>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              Placeholders only — no camera, upload or storage is used. Tapping a
              tile records a demo attachment.
            </p>

            <ul className="mt-3 grid grid-cols-3 gap-2">
              {EVIDENCE_SLOTS.map((slot) => {
                const capturedAt = work.evidence[slot.id];
                const captured = Boolean(capturedAt);
                return (
                  <li key={slot.id}>
                    <button
                      type="button"
                      disabled={locked || captured}
                      onClick={() => attachJobEvidence(booking.id, slot.id)}
                      aria-label={
                        captured
                          ? `${slot.label} attached (demo)`
                          : `Add ${slot.label.toLowerCase()} (demo)`
                      }
                      className={cn(
                        "flex min-h-28 w-full flex-col items-center justify-center gap-1 rounded-md border px-2 py-3 text-center transition-colors",
                        captured
                          ? "border-success/30 bg-success-soft text-success"
                          : "border-dashed border-line-strong bg-canvas text-ink-secondary hover:border-brand/40 hover:bg-brand-subtle",
                        locked && !captured && "opacity-60",
                      )}
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-surface/80">
                        {captured ? (
                          <Check aria-hidden="true" className="size-4" />
                        ) : (
                          <ImagePlus aria-hidden="true" className="size-4" />
                        )}
                      </span>
                      <span className="text-[12px] font-semibold leading-tight">
                        {slot.label}
                      </span>
                      <span
                        className={cn(
                          "text-[10.5px] leading-tight",
                          captured ? "text-success" : "text-ink-muted",
                        )}
                      >
                        {captured && capturedAt
                          ? formatTimestamp(capturedAt)
                          : slot.hint}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Extra-work quote */}
          {quote || quoteEditorOpen ? (
            <section
              aria-labelledby="quote-heading"
              className="rounded-lg border border-line bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2
                    id="quote-heading"
                    className="text-[15px] font-semibold text-ink"
                  >
                    Additional work quote
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    Extra parts or labour need the customer&apos;s approval
                    before you continue.
                  </p>
                </div>
                {quote ? (
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
                        : "Awaiting approval"}
                  </Badge>
                ) : null}
              </div>

              {quote ? (
                <div className="mt-4">
                  <ul className="space-y-2">
                    {quote.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-4 text-[13.5px]"
                      >
                        <span className="text-ink-secondary">
                          {item.description}
                        </span>
                        <span className="shrink-0 font-medium tabular-nums text-ink">
                          {formatINR(item.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-line pt-2.5">
                    <p className="text-[13.5px] font-semibold text-ink">Total</p>
                    <p className="text-[16px] font-[680] tabular-nums text-ink">
                      {formatINR(quoteTotal(quote))}
                    </p>
                  </div>

                  {quote.note ? (
                    <p className="mt-2.5 rounded-md bg-canvas p-3 text-[12.5px] leading-relaxed text-ink-secondary">
                      “{quote.note}”
                    </p>
                  ) : null}

                  {quote.status === "pending" ? (
                    <p className="mt-3 flex gap-2 text-[12.5px] leading-relaxed text-ink-muted">
                      <Clock
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                      Sent {formatTimestamp(quote.submittedAt)}. The customer can
                      approve or decline it from their booking.
                    </p>
                  ) : null}

                  {quote.status === "declined" ? (
                    <p className="mt-3 flex gap-2 text-[12.5px] leading-relaxed text-ink-muted">
                      <TriangleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                      Declined. Continue with the original scope, or send a
                      revised quote below.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {quoteEditorOpen ? (
                <form
                  onSubmit={handleQuoteSubmit}
                  className="mt-4 border-t border-line pt-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-ink">
                      {quote ? "Revised quote" : "Line items"}
                    </p>
                    <p className="text-[11.5px] text-ink-muted">
                      INR · demo only
                    </p>
                  </div>

                  <div className="mt-2 space-y-2">
                    {quoteRows.map((row, index) => (
                      <div
                        key={row.key}
                        className="rounded-md border border-line bg-canvas p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                            Item {index + 1}
                          </p>
                          {quoteRows.length > 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setQuoteRows((rows) =>
                                  rows.filter((entry) => entry.key !== row.key),
                                )
                              }
                              aria-label={`Remove item ${index + 1}`}
                              className="grid size-8 place-items-center rounded-sm text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                            </button>
                          ) : null}
                        </div>
                        <div className="mt-1.5 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_120px]">
                          <TextField
                            label="Description"
                            value={row.description}
                            onChange={(event) =>
                              updateRow(row.key, {
                                description: event.target.value,
                              })
                            }
                            placeholder="Replacement valve and washer"
                            maxLength={90}
                          />
                          <TextField
                            label="Amount (₹)"
                            type="number"
                            inputMode="decimal"
                            min={1}
                            step="1"
                            value={row.amount}
                            onChange={(event) =>
                              updateRow(row.key, { amount: event.target.value })
                            }
                            placeholder="450"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2.5"
                    onClick={() =>
                      setQuoteRows((rows) => [...rows, blankRow()])
                    }
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Add line item
                  </Button>

                  <div className="mt-3">
                    <TextAreaField
                      label="Note for the customer"
                      optional
                      rows={2}
                      value={quoteNote}
                      onChange={(event) => setQuoteNote(event.target.value)}
                      placeholder="Why is this work needed?"
                      maxLength={240}
                    />
                  </div>

                  {quoteError ? (
                    <p
                      role="alert"
                      className="mt-2 text-[12.5px] font-medium text-danger"
                    >
                      {quoteError}
                    </p>
                  ) : null}

                  <Button type="submit" className="mt-3">
                    Send for approval
                  </Button>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                    Sending pauses the job until the customer decides. No payment
                    is taken in this demo.
                  </p>
                </form>
              ) : null}
            </section>
          ) : null}

          {/* Notes */}
          <section
            aria-labelledby="notes-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <h2
              id="notes-heading"
              className="text-[15px] font-semibold text-ink"
            >
              Job notes
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              What you found and what you did. These stay editable after the job
              is completed and are visible to the demo team only.
            </p>

            <div className="mt-3">
              <TextAreaField
                label="Notes"
                rows={4}
                value={notesValue}
                onChange={(event) => {
                  setNotesDraft(event.target.value);
                  setNotesSaved(false);
                }}
                placeholder="Describe the diagnosis, parts used and the final test."
                maxLength={600}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  saveJobNotes(booking.id, notesValue);
                  setNotesDraft(null);
                  setNotesSaved(true);
                }}
                disabled={!notesDirty}
              >
                Save notes
              </Button>
              {notesSaved && !notesDirty ? (
                <p className="text-[12.5px] font-medium text-success">
                  Notes saved in this browser.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <section
            aria-labelledby="next-step-heading"
            className="hidden rounded-lg border border-line bg-surface p-5 lg:block"
          >
            <h2
              id="next-step-heading"
              className="text-[15px] font-semibold text-ink"
            >
              Next step
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
              {next
                ? next.helper
                : quotePending
                  ? "The customer is reviewing your quote."
                  : locked
                    ? "No further workflow actions."
                    : "Waiting for the next update."}
            </p>
            {next ? (
              <Button
                onClick={handleTransition}
                disabled={blockedByChecklist}
                size="lg"
                fullWidth
                className="mt-3"
              >
                {next.label}
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            ) : null}
            {blockedByChecklist ? (
              <p className="mt-2 text-[12px] font-medium text-danger">
                {remaining} checklist item{remaining === 1 ? "" : "s"} still
                open.
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="customer-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="customer-heading"
                className="text-[15px] font-semibold text-ink"
              >
                Customer &amp; address
              </h2>
              <Badge tone="neutral">Demo</Badge>
            </div>

            <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink">
              <UserRound
                aria-hidden="true"
                className="size-4 shrink-0 text-ink-muted"
              />
              {profile.name}
            </p>
            <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-secondary">
              <Phone
                aria-hidden="true"
                className="size-4 shrink-0 text-ink-muted"
              />
              {profile.phone}
            </p>

            <div className="mt-3 flex gap-2.5 rounded-md bg-brand-subtle p-3">
              <MapPin
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-brand"
              />
              <div className="min-w-0">
                <p className="text-[13px] leading-relaxed text-ink">
                  {address ? (
                    <>
                      <span className="font-semibold">{address.label}</span>
                      {` · ${address.line1}`}
                      {address.line2 ? `, ${address.line2}` : ""},{" "}
                      {address.city} {address.pincode}
                    </>
                  ) : (
                    "Address removed from the demo store"
                  )}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-muted">
                  {distance.km} km · {distance.mins} min — simulated route
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              className="mt-3"
              aria-expanded={routeOpen}
              aria-controls="demo-route"
              onClick={() => setRouteOpen((open) => !open)}
            >
              <Navigation aria-hidden="true" className="size-4" />
              Directions (demo)
            </Button>

            {routeOpen ? (
              <div
                id="demo-route"
                className="mt-2 rounded-md border border-line bg-canvas p-3"
              >
                <p className="text-[13px] font-semibold text-ink">
                  Route preview
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-secondary">
                  {distance.km} km · about {distance.mins} min from your last
                  job. Navigation, live GPS and traffic data are simulated — this
                  demo never opens a maps app.
                </p>
              </div>
            ) : null}

            {booking.issueNotes ? (
              <div className="mt-4 border-t border-line pt-3">
                <h3 className="text-[12.5px] font-semibold text-ink">
                  Customer notes
                </h3>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-secondary">
                  {booking.issueNotes}
                </p>
                {booking.attachments.length > 0 ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                    <ImagePlus aria-hidden="true" className="size-3.5" />
                    {booking.attachments.length} attachment
                    {booking.attachments.length === 1 ? "" : "s"} (demo
                    placeholder)
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section
            aria-labelledby="payout-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <h2 id="payout-heading" className="text-[15px] font-semibold text-ink">
              Your payout
            </h2>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Illustrative, after {(commission / (gross || 1) * 100).toFixed(0)}%
              demo commission
            </p>
            <p className="mt-2 text-[26px] font-[680] leading-none tabular-nums text-ink">
              {formatINR(payout)}
            </p>

            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[12.5px]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-secondary">Job value</dt>
                <dd className="font-medium tabular-nums text-ink">
                  {formatINR(gross)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-secondary">Commission</dt>
                <dd className="font-medium tabular-nums text-ink">
                  −{formatINR(commission)}
                </dd>
              </div>
              {quote?.status === "approved" ? (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-secondary">Approved extra work</dt>
                  <dd className="font-medium tabular-nums text-ink">
                    {formatINR(quoteTotal(quote))}
                  </dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-3 flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0"
              />
              Estimates only. Settlements appear on the earnings screen and no
              money moves in this demo.
            </p>

            <Link
              href="/technician/earnings"
              className="mt-3 inline-flex items-center gap-1 rounded-sm text-[12.5px] font-semibold text-brand hover:underline"
            >
              {earnings.completedCount} completed jobs on record
              <ChevronRight aria-hidden="true" className="size-3.5" />
            </Link>
          </section>

          <Notice className="text-[12px] leading-relaxed">
            This job is shared with the customer portal. Every status change here
            updates their booking timeline immediately — all simulated, no
            server involved.
          </Notice>
        </aside>
      </div>

      {/* Mobile / tablet action bar */}
      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:bottom-0 lg:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 sm:px-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-ink-muted">
              {booking.reference}
            </p>
            <p className="truncate text-[12.5px] font-semibold text-ink">
              {blockedByChecklist
                ? `${remaining} checklist item${remaining === 1 ? "" : "s"} left`
                : next
                  ? next.helper
                  : quotePending
                    ? "Waiting on customer approval"
                    : locked
                      ? "Job closed"
                      : "No action available"}
            </p>
          </div>
          {next ? (
            <Button
              onClick={handleTransition}
              disabled={blockedByChecklist}
              className="shrink-0"
            >
              {next.label}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
