"use client";

import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * Compact online/offline switch. Availability is a demo flag stored in the
 * browser — nothing reaches a dispatch system because there isn't one.
 */
export function AvailabilityToggle({ className }: { className?: string }) {
  const { availability, hydrated, setTechnicianOnline } = useDemoStore();
  const online = availability.online;

  return (
    <button
      type="button"
      aria-pressed={online}
      aria-label={online ? "You are online. Tap to go offline" : "You are offline. Tap to go online"}
      disabled={!hydrated}
      onClick={() => setTechnicianOnline(!online)}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-md border px-2.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60",
        online
          ? "border-success/25 bg-success-soft text-success hover:border-success/40"
          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full",
          online ? "bg-success" : "bg-line-strong",
        )}
      />
      {online ? "Online" : "Offline"}
    </button>
  );
}
