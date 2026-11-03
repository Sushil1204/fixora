"use client";

import { ChevronDown, MapPin, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEMO_LOCATIONS } from "@/lib/mock-data";
import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/** Serviceability/location context. Choosing a city updates demo state. */
export function LocationMenu({ compact }: { compact?: boolean }) {
  const { location, setLocation } = useDemoStore();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2 rounded-md border border-transparent text-left transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          compact ? "px-2 py-1.5" : "px-3 py-2",
        )}
      >
        <MapPin aria-hidden="true" className="size-[18px] shrink-0 text-brand" />
        <span className="min-w-0">
          {!compact ? (
            <span className="block text-[11px] font-medium text-ink-muted">
              Serving
            </span>
          ) : null}
          <span className="flex items-center gap-1 text-sm font-semibold text-ink">
            <span className="truncate">
              {compact ? location.area : `${location.area}, ${location.city}`}
            </span>
            <ChevronDown aria-hidden="true" className="size-4 text-ink-muted" />
          </span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Choose service area"
          className="absolute right-0 top-[calc(100%+6px)] z-40 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-line bg-surface p-1.5 shadow-md sm:left-0 sm:right-auto"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[13px] font-medium text-ink-muted">
            Demo service areas
          </p>
          {DEMO_LOCATIONS.map((option) => {
            const active = option.id === location.id;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setLocation(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors hover:bg-brand-subtle",
                  active ? "font-semibold text-ink" : "text-ink-secondary",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate">{option.area}</span>
                  <span className="block text-[12px] font-normal text-ink-muted">
                    {option.city}
                  </span>
                </span>
                {active ? (
                  <Check aria-hidden="true" className="size-4 shrink-0 text-brand" />
                ) : null}
              </button>
            );
          })}
          <p className="border-t border-line px-2.5 pb-1 pt-2 text-[12px] leading-snug text-ink-muted">
            Demo only. Coverage and availability aren&apos;t checked against a live
            network.
          </p>
        </div>
      ) : null}
    </div>
  );
}
