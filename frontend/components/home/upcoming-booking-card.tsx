"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { formatDate, formatSlot } from "@/lib/format";
import { StatusBadge } from "@/components/ui/badge";

/**
 * Home summary of the next active booking. Reads the same demo store as the
 * bookings list, so a booking created in the flow shows up here immediately.
 */
export function UpcomingBookingCard() {
  const { upcomingBookings, addresses, hydrated, signedOut, location } =
    useDemoStore();

  if (!hydrated || signedOut) return null;
  const next = upcomingBookings[0];
  if (!next) return null;

  const address = addresses.find((a) => a.id === next.addressId);

  return (
    <section aria-labelledby="next-booking-heading" className="mt-10">
      <div className="rounded-lg border border-brand/20 bg-brand-subtle p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="next-booking-heading"
            className="text-[13px] font-semibold text-brand"
          >
            Your next booking
          </h2>
          <StatusBadge status={next.status} />
        </div>

        <p className="mt-2 text-[18px] font-semibold leading-snug text-ink">
          {next.serviceName}
        </p>

        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[14px] text-ink-secondary">
          <div className="flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="size-4 text-brand" />
            <dt className="sr-only">Date and time</dt>
            <dd>
              {formatDate(next.date)}, {formatSlot(next.slot)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-4 text-brand" />
            <dt className="sr-only">Address</dt>
            <dd className="truncate">
              {address ? `${address.label}, ${address.line1}` : location.area}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-4 text-brand" />
            <dt className="sr-only">Reference</dt>
            <dd>{next.reference}</dd>
          </div>
        </dl>

        <Link
          href={`/bookings/${next.id}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-[14px] font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View booking
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
