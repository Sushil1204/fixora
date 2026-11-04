"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
}

/**
 * Operations detail drawer. Used for booking, technician and dispute records
 * so the underlying queue keeps its scroll position and filters.
 */
export function AdminDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
}: AdminDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="admin-backdrop-enter absolute inset-0 cursor-default bg-[#101828]/50"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
        tabIndex={-1}
        className={cn(
          "admin-drawer-enter relative flex h-full w-full flex-col bg-surface shadow-2xl outline-none",
          width === "lg" ? "sm:max-w-2xl" : "sm:max-w-xl",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2
              id="admin-drawer-title"
              className="text-[18px] font-semibold leading-tight text-ink"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-[12.5px] text-ink-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Close panel</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <footer className="border-t border-line bg-canvas/60 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
