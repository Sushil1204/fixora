import Link from "next/link";
import { ChevronRight, Clock, MapPin, Navigation } from "lucide-react";
import type { Address, Booking, JobWork } from "@/lib/types";
import { formatINR, formatSlot } from "@/lib/format";
import { StatusBadge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { buildChecklist, demoDistance, jobPayout } from "@/lib/technician";

function statusHint(booking: Booking, work?: JobWork) {
  if (booking.status === "awaiting_approval") {
    return "Waiting on customer approval";
  }
  if (booking.status === "completed") return "Completed — notes stay editable";
  if (booking.status === "assigned") return "Accept to confirm this visit";
  if (booking.status === "accepted") return "Accepted — start the trip when ready";
  if (booking.status === "on_the_way") return "Travelling to the address";

  const checklist = buildChecklist(booking.categoryId);
  const done = checklist.filter((item) => work?.done.includes(item.id)).length;
  return `Checklist ${done} of ${checklist.length}`;
}

/** One job in a technician list: schedule, service, area and the next action. */
export function JobCard({
  booking,
  address,
  work,
}: {
  booking: Booking;
  address?: Address;
  work?: JobWork;
}) {
  const distance = demoDistance(booking);

  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-brand-subtle px-2 py-1 text-[12.5px] font-semibold tabular-nums text-brand">
          <Clock aria-hidden="true" className="size-3.5" />
          {formatSlot(booking.slot)}
        </span>
        <StatusBadge status={booking.status} />
      </div>

      <h3 className="mt-3 text-[16.5px] font-semibold leading-snug text-ink">
        {booking.serviceName}
      </h3>

      <p className="mt-1 flex items-start gap-1.5 text-[13px] leading-relaxed text-ink-secondary">
        <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-ink-muted" />
        <span className="min-w-0">
          {address
            ? `${address.label} · ${address.line1}${
                address.line2 ? `, ${address.line2}` : ""
              }`
            : "Address on the booking"}
        </span>
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-muted">
        <Navigation aria-hidden="true" className="size-3.5 shrink-0" />
        {distance.km} km · {distance.mins} min — demo route
      </p>

      {booking.issueNotes ? (
        <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
          {booking.issueNotes}
        </p>
      ) : null}

      <div className="mt-3.5 flex items-end justify-between gap-3 border-t border-line pt-3">
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-ink">
            {statusHint(booking, work)}
          </p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            {booking.reference} · {formatINR(jobPayout(booking, work))} payout
          </p>
        </div>
        <Link
          href={`/technician/jobs/${booking.id}`}
          aria-label={`Open job ${booking.reference}: ${booking.serviceName}`}
          className={buttonStyles({ size: "md" }) + " shrink-0"}
        >
          Open job
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
