"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CalendarX2, ClipboardList } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import type { Booking } from "@/lib/types";
import { BookingCard } from "./booking-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

function matchesTab(booking: Booking, tab: TabId) {
  if (tab === "completed") return booking.status === "completed";
  if (tab === "cancelled") return booking.status === "cancelled";
  return (
    booking.status === "requested" ||
    booking.status === "assigned" ||
    booking.status === "accepted" ||
    booking.status === "on_the_way" ||
    booking.status === "arrived" ||
    booking.status === "in_progress" ||
    booking.status === "awaiting_approval"
  );
}

interface BookingsViewProps {
  initialTab?: TabId;
  /** ?demoState=error — reachable recovery path for demo walkthroughs */
  initialError?: boolean;
}

export function BookingsView({
  initialTab = "upcoming",
  initialError = false,
}: BookingsViewProps) {
  const { bookings, addresses, hydrated } = useDemoStore();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    initialError ? "error" : "loading",
  );

  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 320);
    return () => clearTimeout(timer);
  }, [status]);

  const filtered = bookings
    .filter((booking) => matchesTab(booking, tab))
    .sort((a, b) => {
      if (tab === "upcoming") return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });

  const loading = !hydrated || status === "loading";

  return (
    <div>
      <div
        role="tablist"
        aria-label="Booking status"
        className="flex gap-1 rounded-md border border-line bg-surface p-1"
      >
        {TABS.map((item) => {
          const count = bookings.filter((b) => matchesTab(b, item.id)).length;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active}
              aria-controls={`panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-2.5 text-[13.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active
                  ? "bg-brand text-white"
                  : "text-ink-secondary hover:bg-canvas hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                  active ? "bg-white/15 text-white" : "bg-canvas text-ink-muted",
                )}
              >
                {hydrated ? count : "–"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="mt-4"
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : status === "error" ? (
          <ErrorState
            title="Bookings didn't load"
            description="We couldn't read your booking list. Retrying keeps everything as it was."
            onRetry={() => setStatus("loading")}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={
              tab === "upcoming"
                ? CalendarDays
                : tab === "completed"
                  ? ClipboardList
                  : CalendarX2
            }
            title={
              tab === "upcoming"
                ? "No upcoming visits"
                : tab === "completed"
                  ? "No completed bookings yet"
                  : "Nothing cancelled"
            }
            description={
              tab === "upcoming"
                ? "When you book a repair, it appears here with its status and next step."
                : tab === "completed"
                  ? "Finished visits will collect here with their estimate and warranty details."
                  : "Bookings you cancel will be listed here with the cancellation time."
            }
            action={
              <Link href="/services" className={buttonStyles({ size: "md" })}>
                Book a repair
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((booking) => (
              <li key={booking.id}>
                <BookingCard
                  booking={booking}
                  address={addresses.find((a) => a.id === booking.addressId)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
