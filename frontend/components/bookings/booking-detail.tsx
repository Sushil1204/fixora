"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CircleCheck,
  CreditCard,
  ImagePlus,
  MapPin,
  ReceiptText,
  Wallet,
  Banknote,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { DEMO_LOCATIONS } from "@/lib/mock-data";
import { formatDate, formatINR, formatSlot } from "@/lib/format";
import type { Booking, PaymentPreference } from "@/lib/types";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EstimateSummary } from "./estimate-summary";
import { StatusTimeline } from "./status-timeline";

const PAYMENT_LABELS: Record<PaymentPreference, string> = {
  "pay-after-service": "Pay after the service",
  "demo-upi": "Demo UPI confirmation",
  "demo-card": "Demo card",
};

function isCancellable(booking: Booking) {
  return booking.status === "requested" || booking.status === "assigned";
}

export function BookingDetail({
  bookingId,
  justCreated,
}: {
  bookingId: string;
  justCreated: boolean;
}) {
  const { bookings, addresses, hydrated, cancelBooking } = useDemoStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  if (!hydrated) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Booking not found"
        description="This reference isn't in the demo store. It may have been cleared, or the link may be from a reset demo."
        action={
          <Link href="/bookings" className={buttonStyles({ size: "md" })}>
            Back to bookings
          </Link>
        }
      />
    );
  }

  const address = addresses.find((a) => a.id === booking.addressId);
  const fallbackArea = DEMO_LOCATIONS[0];
  const showCancelledBanner = cancelled || booking.status === "cancelled";

  return (
    <div>
      {justCreated ? (
        <div className="mb-4">
          <Notice tone="success" title="Booking requested">
            Your booking is saved with reference{" "}
            <strong>{booking.reference}</strong>. This is a simulated booking —
            no technician has been dispatched and no payment was taken.
          </Notice>
        </div>
      ) : null}

      {showCancelledBanner && !justCreated ? (
        <div className="mb-4">
          <Notice tone="warning" title="This booking is cancelled">
            The visit won&apos;t take place. You can book the same service again
            whenever you need it.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-4">
          {/* Summary */}
          <section
            aria-labelledby="booking-summary-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] text-ink-muted">
                  Reference {booking.reference}
                </p>
                <h2
                  id="booking-summary-heading"
                  className="mt-1 text-[20px] font-[650] leading-snug text-ink sm:text-[24px]"
                >
                  {booking.serviceName}
                </h2>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <dl className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              <div className="flex gap-2.5">
                <CalendarDays
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-ink-muted"
                />
                <div>
                  <dt className="text-[12px] font-medium text-ink-muted">
                    Scheduled for
                  </dt>
                  <dd className="mt-0.5 text-[14px] text-ink">
                    {formatDate(booking.date)}
                    <span className="block text-ink-secondary">
                      {formatSlot(booking.slot)}
                    </span>
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-ink-muted"
                />
                <div className="min-w-0">
                  <dt className="text-[12px] font-medium text-ink-muted">
                    Address
                  </dt>
                  <dd className="mt-0.5 text-[14px] leading-relaxed text-ink">
                    {address ? (
                      <>
                        <Badge tone="neutral" className="mr-1.5 align-middle">
                          {address.label}
                        </Badge>
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""},{" "}
                        {address.city} {address.pincode}
                      </>
                    ) : (
                      `${fallbackArea.area}, ${fallbackArea.city} (demo address removed)`
                    )}
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Wallet
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-ink-muted"
                />
                <div>
                  <dt className="text-[12px] font-medium text-ink-muted">
                    Payment preference
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-[14px] text-ink">
                    {booking.paymentPreference === "pay-after-service" ? (
                      <Banknote aria-hidden="true" className="size-4 text-ink-muted" />
                    ) : (
                      <CreditCard
                        aria-hidden="true"
                        className="size-4 text-ink-muted"
                      />
                    )}
                    {PAYMENT_LABELS[booking.paymentPreference]}
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5">
                <ReceiptText
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-ink-muted"
                />
                <div>
                  <dt className="text-[12px] font-medium text-ink-muted">
                    Estimated total
                  </dt>
                  <dd className="mt-0.5 text-[14px] text-ink">
                    {formatINR(booking.estimate.total)}
                    <span className="block text-[12.5px] text-ink-muted">
                      Before parts; final after inspection
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Timeline */}
          <section
            aria-labelledby="timeline-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="timeline-heading"
                className="flex items-center gap-2 text-[16px] font-semibold text-ink"
              >
                <CircleCheck aria-hidden="true" className="size-4 text-brand" />
                Status timeline
              </h2>
              <p className="text-[12.5px] text-ink-muted">
                Times shown in demo data
              </p>
            </div>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              Each step records when it happened and what it means. Status changes
              aren&apos;t automatic in this demo.
            </p>
            <div className="mt-4">
              <StatusTimeline timeline={booking.timeline} />
            </div>
          </section>

          {/* Notes and photos */}
          <section
            aria-labelledby="notes-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <h2 id="notes-heading" className="text-[16px] font-semibold text-ink">
              Notes for the technician
            </h2>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-secondary">
              {booking.issueNotes || "No notes were added to this booking."}
            </p>

            {booking.attachments.length > 0 ? (
              <div className="mt-3">
                <p className="text-[13px] font-medium text-ink-muted">
                  Attachments (demo placeholders)
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {booking.attachments.map((name) => (
                    <li
                      key={name}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5 py-1.5 text-[13px] text-ink-secondary"
                    >
                      <ImagePlus aria-hidden="true" className="size-4 text-ink-muted" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <EstimateSummary estimate={booking.estimate} />

          <section
            aria-labelledby="actions-heading"
            className="rounded-lg border border-line bg-surface p-5"
          >
            <h2 id="actions-heading" className="text-[15px] font-semibold text-ink">
              Need to change something?
            </h2>

            <div className="mt-3 flex flex-col gap-2.5">
              {isCancellable(booking) ? (
                <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                  Cancel booking
                </Button>
              ) : booking.status === "completed" ? (
                <Link
                  href={`/services/${booking.serviceSlug}`}
                  className={buttonStyles({ variant: "primary", fullWidth: true })}
                >
                  Book this service again
                </Link>
              ) : booking.status === "cancelled" ? (
                <Link
                  href={`/services/${booking.serviceSlug}`}
                  className={buttonStyles({ variant: "primary", fullWidth: true })}
                >
                  Book again
                </Link>
              ) : (
                <Notice tone="info">
                  This visit is already underway. To change or cancel, raise a
                  support case and the demo team will pick it up.
                </Notice>
              )}

              <Link
                href={`/support?booking=${encodeURIComponent(booking.reference)}`}
                className={buttonStyles({ variant: "ghost", fullWidth: true })}
              >
                Get support for this booking
              </Link>
            </div>

            {isCancellable(booking) ? (
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
                Free up to 4 hours before the visit. After a technician is
                assigned a ₹99 fee applies — simulated here, never charged.
              </p>
            ) : null}
          </section>

          <Notice className="text-[13px]">
            This booking lives in your browser only. Clearing demo data or using
            another device won&apos;t carry it over.
          </Notice>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        description={`${booking.serviceName} on ${formatDate(
          booking.date,
        )} will be cancelled in the demo store. You'll keep the reference and can book again any time.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          cancelBooking(booking.id);
          setCancelled(true);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
