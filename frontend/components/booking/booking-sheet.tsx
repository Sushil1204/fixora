"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Service } from "@/lib/types";
import { BookingFlow } from "./booking-flow";
import { cn } from "@/lib/cn";

const CLOSE_MS = 260;

/**
 * Booking wizard presentation:
 * - Mobile (<768px): a bottom sheet that slides up over the page, with a
 *   backdrop, close button, focus trap, Escape-to-close and a locked body.
 * - Desktop: the same wizard inline in the page, exactly as before.
 *
 * One instance of the flow renders at all sizes, so resizing never resets the
 * half-finished booking. Closing returns to the service detail page.
 */
export function BookingSheet({ service }: { service: Service }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Slide in after mount so the transform transition actually runs.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Modal behavior only while the sheet is the active surface.
  useEffect(() => {
    if (!isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOpen(false);
    window.setTimeout(() => {
      router.push(`/services/${service.slug}`);
    }, CLOSE_MS);
  }, [router, service.slug]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isMobile) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);

    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 md:static md:z-auto">
      {/* Dimmed page behind the mobile sheet */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink/45 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role={isMobile ? "dialog" : undefined}
        aria-modal={isMobile ? true : undefined}
        aria-labelledby={isMobile ? "booking-sheet-title" : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-xl border border-line bg-canvas shadow-md outline-none transition-transform duration-300 ease-out md:static md:max-h-none md:translate-y-0 md:rounded-none md:border-0 md:bg-transparent md:shadow-none",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Sheet header — mobile only */}
        <div className="border-b border-line bg-surface md:hidden">
          <div className="flex justify-center pt-2">
            <span
              aria-hidden="true"
              className="h-1 w-10 rounded-full bg-line-strong"
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-2">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink-muted">Booking</p>
              <h2
                id="booking-sheet-title"
                className="truncate text-[15px] font-semibold text-ink"
              >
                {service.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Close booking</span>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 md:overflow-visible md:p-0">
          <BookingFlow service={service} inSheet />
        </div>
      </div>
    </div>
  );
}
