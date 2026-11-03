/**
 * Fixora domain models — Phase 1 (customer portal).
 * All data in this demo is fictional and lives in lib/mock-data.ts.
 */

export type ServiceCategoryId =
  | "plumbing"
  | "electrical"
  | "ac-repair"
  | "appliance-repair"
  | "carpentry"
  | "mobile-repair";

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  /** One-line discovery description */
  description: string;
  /** Lucide icon name resolved in components (see docs/asset_sources.md) */
  icon: "droplet" | "zap" | "wind" | "refrigerator" | "hammer" | "smartphone";
}

export interface AdditionalCharge {
  item: string;
  note: string;
}

export interface Service {
  slug: string;
  name: string;
  categoryId: ServiceCategoryId;
  shortDescription: string;
  /** Starting price in INR (demo) — displayed as "From ₹499" */
  startPrice: number;
  /** Estimated duration in minutes */
  durationMins: number;
  /** Show on the home "Popular services" rail */
  popular: boolean;
  includedWork: string[];
  exclusions: string[];
  additionalCharges: AdditionalCharge[];
  cancellationPolicy: string;
  warrantySummary: string;
}

export interface Address {
  id: string;
  label: "Home" | "Work" | "Other";
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  phone: string;
}

export type BookingStatus =
  | "requested"
  | "assigned"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface TimelineStep {
  status: BookingStatus;
  /** Short human explanation shown under the step label */
  note: string;
  /** ISO timestamp; absent for steps that have not happened yet */
  at?: string;
}

export type PaymentPreference =
  | "pay-after-service"
  | "demo-upi"
  | "demo-card";

export interface EstimateLine {
  label: string;
  amount: number;
  kind: "charge" | "fee" | "tax";
}

export interface Estimate {
  lines: EstimateLine[];
  total: number;
  disclaimer: string;
}

export interface Booking {
  id: string;
  /** Display reference, e.g. FX-2026-0142 */
  reference: string;
  serviceSlug: string;
  serviceName: string;
  categoryId: ServiceCategoryId;
  addressId: string;
  /** ISO date, e.g. 2026-11-08 */
  date: string;
  /** Slot id, e.g. "10:00" (start of a 2-hour window) */
  slot: string;
  issueNotes: string;
  attachments: string[];
  estimate: Estimate;
  paymentPreference: PaymentPreference;
  status: BookingStatus;
  timeline: TimelineStep[];
  createdAt: string;
}

export type NotificationKind = "booking" | "estimate" | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Optional link target within the app */
  href?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

/** Saved time slots (2-hour windows) for the scheduling step */
export interface TimeSlot {
  id: string;
  label: string;
}
