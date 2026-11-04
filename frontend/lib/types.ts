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
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "awaiting_approval"
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
  /** Verified technician assigned by demo dispatch (absent until assignment) */
  technicianId?: string;
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

/* ----------------------------- Technician portal ----------------------------- */

/** Checklist items sit either side of the visit. */
export type JobPhase = "pre" | "post";

export interface JobChecklistItem {
  id: string;
  phase: JobPhase;
  label: string;
}

/** Photo evidence is a simulated placeholder — nothing is uploaded. */
export interface JobEvidenceSlot {
  id: string;
  label: string;
  hint: string;
}

export interface WorkQuoteItem {
  id: string;
  description: string;
  amount: number;
}

export type WorkQuoteStatus = "pending" | "approved" | "declined";

/** Extra work raised by the technician, awaiting the customer's decision. */
export interface WorkQuote {
  items: WorkQuoteItem[];
  note: string;
  status: WorkQuoteStatus;
  submittedAt: string;
  decidedAt?: string;
}

/**
 * Technician-side state for one booking. The booking itself stays the single
 * source of truth for workflow status and timeline.
 */
export interface JobWork {
  /** Completed checklist item ids */
  done: string[];
  /** Evidence slot id -> capture timestamp */
  evidence: Record<string, string>;
  quote?: WorkQuote;
  /** Post-job notes; still editable after completion */
  notes: string;
}export type JobWorkMap = Record<string, JobWork>;
export interface TechnicianAvailability {
  online: boolean;
  /** Weekday numbers, 0 = Sunday */
  workingDays: number[];
}

/* -------------------------------- Admin portal -------------------------------- */

export type AdminRange = "7d" | "30d" | "90d";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface TechnicianDocument {
  id: string;
  kind: "identity" | "police" | "skill" | "address";
  name: string;
  status: VerificationStatus;
  /** ISO timestamp; documents are simulated placeholders */
  uploadedAt: string;
  note: string;
}

export interface TechnicianRecord {
  id: string;
  code: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  skills: ServiceCategoryId[];
  coverage: string[];
  rating: string;
  jobsCompleted: number;
  yearsExperience: number;
  joinedAt: string;
  lastActiveAt: string;
  verification: VerificationStatus;
  verificationNote?: string;
  documents: TechnicianDocument[];
}

export type DisputePriority = "high" | "medium" | "low";
export type DisputeStatus = "open" | "investigating" | "resolved";
export type DisputeKind = "quality" | "billing" | "delay" | "damage";

export interface DisputeUpdate {
  id: string;
  /** Customer-safe wording only */
  body: string;
  at: string;
  author: string;
}

export interface DisputeNote {
  id: string;
  body: string;
  at: string;
  author: string;
}

/** A support or dispute case linked to a demo booking. */
export interface DisputeCase {
  id: string;
  reference: string;
  bookingId: string;
  kind: DisputeKind;
  priority: DisputePriority;
  status: DisputeStatus;
  /** Admin team member name, or null when unassigned */
  owner: string | null;
  summary: string;
  openedAt: string;
  /** Internal SLA target in hours */
  slaHours: number;
  /** Simulated evidence placeholders */
  evidence: string[];
  /** Safe to surface to the customer */
  customerUpdates: DisputeUpdate[];
  /** Never shown in the customer portal */
  internalNotes: DisputeNote[];
  resolution?: string;
  resolvedAt?: string;
}

export type CatalogStatus = "live" | "draft" | "archived";

/** Admin catalogue record wrapping the seeded customer-facing service. */
export interface CatalogEntry extends Service {
  status: CatalogStatus;
  /** How the price is presented, e.g. starting price or inspection quote */
  priceBasis: string;
  updatedAt: string;
}
