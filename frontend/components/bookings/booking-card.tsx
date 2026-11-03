import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, ReceiptText } from "lucide-react";
import type { Address, Booking } from "@/lib/types";
import { formatDate, formatINR, formatSlot } from "@/lib/format";
import { StatusBadge } from "@/components/ui/badge";

interface BookingCardProps {
  booking: Booking;
  address?: Address;
}

/** Booking list card: service, schedule, reference, status, next action. */
export function BookingCard({ booking, address }: BookingCardProps) {
  const isOpen =
    booking.status !== "completed" && booking.status !== "cancelled";

  return (
    <article className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-[16.5px] font-semibold leading-snug text-ink">
            {booking.serviceName}
          </h3>
          <p className="mt-1 text-[13px] text-ink-muted">
            Reference {booking.reference}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="mt-3 grid gap-1.5 text-[13.5px] text-ink-secondary sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <div>
            <dt className="sr-only">Schedule</dt>
            <dd>
              {formatDate(booking.date)}, {formatSlot(booking.slot)}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <div>
            <dt className="sr-only">Address</dt>
            <dd className="truncate">
              {address
                ? `${address.label} · ${address.line1}, ${address.city}`
                : "Address unavailable"}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ReceiptText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
          <div>
            <dt className="sr-only">Estimated total</dt>
            <dd>
              Estimated {formatINR(booking.estimate.total)}
              <span className="text-ink-muted"> · before parts</span>
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
        <p className="text-[13px] text-ink-muted">
          {isOpen
            ? "Track the visit and see who's assigned."
            : booking.status === "completed"
              ? "Warranty and estimate stay available on this booking."
              : "Cancelled before completion. No charge was raised."}
        </p>
        <Link
          href={`/bookings/${booking.id}`}
          className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[13.5px] font-semibold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View details
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
