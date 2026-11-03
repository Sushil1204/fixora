"use client";

import { useSyncExternalStore } from "react";
import { upcomingDates } from "./format";

/**
 * The next N dates, computed on the client only.
 *
 * Reading the clock during prerendering would bake a build-time date into the
 * static HTML, so the server snapshot is an empty list and the real dates are
 * substituted once React hydrates.
 */
const EMPTY: string[] = [];
let cached: { key: string; dates: string[] } | null = null;

function noSubscription() {
  return () => {};
}

function clientSnapshot(count: number): string[] {
  if (!cached || cached.key !== String(count)) {
    cached = { key: String(count), dates: upcomingDates(count) };
  }
  return cached.dates;
}

function serverSnapshot(): string[] {
  return EMPTY;
}

export function useUpcomingDates(count: number): string[] {
  return useSyncExternalStore(
    noSubscription,
    () => clientSnapshot(count),
    serverSnapshot,
  );
}
