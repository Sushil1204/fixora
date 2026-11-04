/**
 * Admin / operations domain helpers.
 *
 * Fictional demo content and presentation metadata for the operations portal.
 * Everything is client-rendered from the central demo store — no network calls.
 */
import type {
  AdminRange,
  Booking,
  CatalogStatus,
  DisputeKind,
  DisputePriority,
  DisputeStatus,
  TechnicianDocument,
  VerificationStatus,
} from "./types";

export const ADMIN_PROFILE = {
  name: "Priya Nair",
  initials: "PN",
  role: "Operations lead",
  email: "priya.nair@fixora.example",
} as const;

/** Demo owners available in dispute assignment controls. */
export const ADMIN_TEAM = ["Priya Nair", "Dev Patel", "Anita Rao"] as const;

export const REPORTING_RANGES: {
  id: AdminRange;
  label: string;
  short: string;
  days: number;
}[] = [
  { id: "7d", label: "Last 7 days", short: "7 days", days: 7 },
  { id: "30d", label: "Last 30 days", short: "30 days", days: 30 },
  { id: "90d", label: "Last 90 days", short: "90 days", days: 90 },
];

export function rangeDays(range: AdminRange): number {
  return REPORTING_RANGES.find((item) => item.id === range)?.days ?? 30;
}

function startOfRange(range: AdminRange, now = new Date()): Date {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - (rangeDays(range) - 1));
  return start;
}

function shortDay(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Explicit reporting period, e.g. "6 Oct – 4 Nov 2026". */
export function formatRangePeriod(range: AdminRange, now = new Date()): string {
  const start = startOfRange(range, now);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${shortDay(start)} – ${shortDay(end)} ${end.getFullYear()}`
    : `${shortDay(start)} ${start.getFullYear()} – ${shortDay(end)} ${end.getFullYear()}`;
}

/** Timestamp inside the selected reporting window. */
export function withinRange(
  iso: string,
  range: AdminRange,
  now = new Date(),
): boolean {
  const value = new Date(iso).getTime();
  if (Number.isNaN(value)) return false;
  return value >= startOfRange(range, now).getTime();
}

export function rangeLabel(range: AdminRange): string {
  return REPORTING_RANGES.find((item) => item.id === range)?.label ?? "Last 30 days";
}

/* --------------------------------- Labels --------------------------------- */

export const verificationMeta: Record<
  VerificationStatus,
  { label: string; tone: "warning" | "success" | "danger" }
> = {
  pending: { label: "Pending review", tone: "warning" },
  verified: { label: "Verified", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const documentKindLabel: Record<TechnicianDocument["kind"], string> = {
  identity: "Government ID",
  police: "Police verification",
  skill: "Skill certificate",
  address: "Address proof",
};

export const disputePriorityMeta: Record<
  DisputePriority,
  { label: string; tone: "danger" | "warning" | "neutral" }
> = {
  high: { label: "High", tone: "danger" },
  medium: { label: "Medium", tone: "warning" },
  low: { label: "Low", tone: "neutral" },
};

export const disputeStatusMeta: Record<
  DisputeStatus,
  { label: string; tone: "danger" | "info" | "success" }
> = {
  open: { label: "Open", tone: "danger" },
  investigating: { label: "Investigating", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
};

export const disputeKindLabel: Record<DisputeKind, string> = {
  quality: "Service quality",
  billing: "Billing",
  delay: "Delay / no-show",
  damage: "Damage",
};

export const catalogStatusMeta: Record<
  CatalogStatus,
  { label: string; tone: "success" | "warning" | "neutral"; hint: string }
> = {
  live: {
    label: "Live",
    tone: "success",
    hint: "Listed as available in the demo catalogue record",
  },
  draft: {
    label: "Draft",
    tone: "warning",
    hint: "Not published in the demo catalogue",
  },
  archived: {
    label: "Archived",
    tone: "neutral",
    hint: "Retired from the demo catalogue",
  },
};

/* -------------------------------- Helpers --------------------------------- */

export const PRIORITY_WEIGHT: Record<DisputePriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function disputeAgeHours(openedAt: string, now = Date.now()): number {
  return Math.max(0, (now - new Date(openedAt).getTime()) / 3600000);
}

/** "8h" / "2d 6h" — compact age used in queues. */
export function formatAge(hours: number): string {
  if (hours < 1) return "<1h";
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const rest = Math.round(hours % 24);
  return rest > 0 ? `${days}d ${rest}h` : `${days}d`;
}

export function initialsFor(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const ACTIVE_BOOKING_STATUSES = [
  "assigned",
  "accepted",
  "on_the_way",
  "arrived",
  "in_progress",
  "awaiting_approval",
] as const;

export function activeJobCount(bookings: Booking[], technicianId: string): number {
  return bookings.filter(
    (booking) =>
      booking.technicianId === technicianId &&
      (ACTIVE_BOOKING_STATUSES as readonly string[]).includes(booking.status),
  ).length;
}

export function technicianActivityLabel(activeJobs: number): {
  label: string;
  tone: "success" | "warning" | "info";
} {
  if (activeJobs >= 2) return { label: "On jobs", tone: "warning" };
  if (activeJobs === 1) return { label: "Assigned", tone: "info" };
  return { label: "Available", tone: "success" };
}
