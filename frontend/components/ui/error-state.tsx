"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  retrying?: boolean;
}

/**
 * Retryable error panel. Used when a demo data read fails so the recovery
 * path is a real, working action rather than a dead screen.
 */
export function ErrorState({
  title = "This didn't load",
  description = "Something interrupted the request. Your data is safe — try again.",
  onRetry,
  retrying,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface px-6 py-12 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
        <TriangleAlert aria-hidden="true" className="size-6" />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="max-w-sm text-[15px] leading-relaxed text-ink-muted">
        {description}
      </p>
      <Button
        variant="secondary"
        onClick={onRetry}
        disabled={retrying}
        className="mt-2"
      >
        <RefreshCw
          aria-hidden="true"
          className={retrying ? "size-4 animate-spin" : "size-4"}
        />
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
