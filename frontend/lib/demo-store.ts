"use client";

/**
 * Demo state as a tiny external store.
 *
 * Why not useState + useEffect? The persisted state lives in an external system
 * (localStorage), so it is read through useSyncExternalStore. That keeps the
 * server snapshot deterministic (no clock, no storage) and lets components
 * subscribe without setting state inside effects.
 *
 * No backend, no network: actions only mutate this in-memory object and mirror
 * it to localStorage.
 */
import {
  DEMO_ADDRESSES,
  DEMO_LOCATIONS,
  DEMO_PROFILE,
  createSeedBookings,
  createSeedCatalog,
  createSeedDisputes,
  createSeedJobWork,
  createSeedNotifications,
  createSeedTechnicians,
  getServiceBySlug,
} from "./mock-data";
import { ADMIN_PROFILE, ADMIN_TEAM } from "./admin";
import { buildEstimate } from "./pricing";
import { formatDate } from "./format";
import {
  buildTimeline,
  canTransition,
  isJobLocked,
  stampsFromTimeline,
} from "./job-workflow";
import { TECHNICIAN, buildChecklist } from "./technician";
import type {
  Address,
  AdminRange,
  AppNotification,
  Booking,
  BookingStatus,
  CatalogEntry,
  CatalogStatus,
  DisputeCase,
  DisputeUpdate,
  JobWork,
  JobWorkMap,
  NotificationKind,
  PaymentPreference,
  TechnicianAvailability,
  TechnicianDocument,
  TechnicianRecord,
  UserProfile,
  WorkQuote,
} from "./types";

const STORAGE_KEY = "fixora:demo:v3";
const STORAGE_VERSION = 3;

const REPORTING_RANGES: AdminRange[] = ["7d", "30d", "90d"];

export const DEFAULT_AVAILABILITY: TechnicianAvailability = {
  online: true,
  workingDays: [1, 2, 3, 4, 5, 6],
};

export interface DemoState {
  profile: UserProfile;
  addresses: Address[];
  bookings: Booking[];
  notifications: AppNotification[];
  locationId: (typeof DEMO_LOCATIONS)[number]["id"];
  signedOut: boolean;
  /** Technician-side per-booking state: checklist, evidence, quote, notes */
  jobWork: JobWorkMap;
  availability: TechnicianAvailability;
  /** Admin-controlled roster, dispute queue and catalogue records */
  technicians: TechnicianRecord[];
  disputes: DisputeCase[];
  catalog: CatalogEntry[];
  reportingRange: AdminRange;
  /** False until browser storage has been read on the client */
  hydrated: boolean;
}

export interface BookingDraft {
  serviceSlug: string;
  addressId: string;
  date: string;
  slot: string;
  issueNotes: string;
  attachments: string[];
  paymentPreference: PaymentPreference;
}

export interface QuoteDraftItem {
  description: string;
  amount: number | string;
}

/**
 * Server snapshot: static and clock-free so prerendering is deterministic.
 * Lists render their loading state until the client snapshot arrives.
 */
const SERVER_STATE: DemoState = {
  profile: DEMO_PROFILE,
  addresses: DEMO_ADDRESSES,
  bookings: [],
  notifications: [],
  locationId: "koramangala",
  signedOut: false,
  jobWork: {},
  availability: DEFAULT_AVAILABILITY,
  technicians: [],
  disputes: [],
  catalog: [],
  reportingRange: "30d",
  hydrated: false,
};

let current: DemoState | null = null;
const listeners = new Set<() => void>();

function buildSeedState(): DemoState {
  return {
    profile: DEMO_PROFILE,
    addresses: DEMO_ADDRESSES,
    bookings: createSeedBookings(),
    notifications: createSeedNotifications(),
    locationId: "koramangala",
    signedOut: false,
    jobWork: createSeedJobWork(),
    availability: DEFAULT_AVAILABILITY,
    technicians: createSeedTechnicians(),
    disputes: createSeedDisputes(),
    catalog: createSeedCatalog(),
    reportingRange: "30d",
    hydrated: true,
  };
}

function readPersisted(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as (Partial<DemoState> & { v?: number }) | null;
    if (!parsed || parsed.v !== STORAGE_VERSION || !Array.isArray(parsed.bookings)) {
      return null;
    }
    return {
      profile: parsed.profile ?? DEMO_PROFILE,
      addresses: Array.isArray(parsed.addresses)
        ? parsed.addresses
        : DEMO_ADDRESSES,
      bookings: parsed.bookings as Booking[],
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : createSeedNotifications(),
      locationId: parsed.locationId ?? "koramangala",
      signedOut: Boolean(parsed.signedOut),
      jobWork:
        parsed.jobWork && typeof parsed.jobWork === "object"
          ? (parsed.jobWork as JobWorkMap)
          : createSeedJobWork(),
      availability: parsed.availability ?? DEFAULT_AVAILABILITY,
      technicians: Array.isArray(parsed.technicians)
        ? parsed.technicians
        : createSeedTechnicians(),
      disputes: Array.isArray(parsed.disputes)
        ? parsed.disputes
        : createSeedDisputes(),
      catalog: Array.isArray(parsed.catalog)
        ? parsed.catalog
        : createSeedCatalog(),
      reportingRange: REPORTING_RANGES.includes(parsed.reportingRange as AdminRange)
        ? (parsed.reportingRange as AdminRange)
        : "30d",
      hydrated: true,
    };
  } catch {
    return null;
  }
}

/** Lazy init keeps storage access out of both SSR and module evaluation. */
export function getSnapshot(): DemoState {
  if (!current) {
    current = typeof window === "undefined" ? SERVER_STATE : (readPersisted() ?? buildSeedState());
  }
  return current;
}

export function getServerSnapshot(): DemoState {
  return SERVER_STATE;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Only durable fields are written; `hydrated` is a runtime detail. */
function persist(state: DemoState) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: STORAGE_VERSION,
        profile: state.profile,
        addresses: state.addresses,
        bookings: state.bookings,
        notifications: state.notifications,
        locationId: state.locationId,
        signedOut: state.signedOut,
        jobWork: state.jobWork,
        availability: state.availability,
        technicians: state.technicians,
        disputes: state.disputes,
        catalog: state.catalog,
        reportingRange: state.reportingRange,
      }),
    );
  } catch {
    // Storage blocked or full: the demo keeps working in memory.
  }
}

function commit(next: DemoState) {
  current = { ...next, hydrated: true };
  persist(current);
  listeners.forEach((listener) => listener());
}

/* --------------------------------- Actions --------------------------------- */

export function createBooking(draft: BookingDraft): Booking {
  const state = getSnapshot();
  const service = getServiceBySlug(draft.serviceSlug);
  if (!service) throw new Error(`Unknown service: ${draft.serviceSlug}`);

  const now = new Date().toISOString();
  const booking: Booking = {
    id: `bk-${Date.now().toString(36)}`,
    reference: `FX-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`,
    serviceSlug: service.slug,
    serviceName: service.name,
    categoryId: service.categoryId,
    addressId: draft.addressId,
    date: draft.date,
    slot: draft.slot,
    issueNotes: draft.issueNotes,
    attachments: draft.attachments,
    estimate: buildEstimate(service.startPrice),
    paymentPreference: draft.paymentPreference,
    status: "requested",
    timeline: buildTimeline("requested", { requested: now }),
    createdAt: now,
  };

  commit({
    ...state,
    bookings: [booking, ...state.bookings],
    notifications: [
      makeNotification(
        "booking",
        `Booking ${booking.reference} requested`,
        `Your ${service.name} request for ${formatDate(
          booking.date,
        )} (${booking.slot}) has been received. We'll assign a technician shortly.`,
        `/bookings/${booking.id}`,
      ),
      ...state.notifications,
    ],
  });

  return booking;
}

export function cancelBooking(bookingId: string) {
  const state = getSnapshot();
  const now = new Date().toISOString();
  commit({
    ...state,
    bookings: state.bookings.map((booking) =>
      booking.id === bookingId &&
      booking.status !== "cancelled" &&
      booking.status !== "completed"
        ? {
            ...booking,
            status: "cancelled",
            timeline: [
              ...booking.timeline.filter((step) => step.at),
              {
                status: "cancelled" as const,
                note: "Cancelled from the bookings screen (demo)",
                at: now,
              },
            ],
          }
        : booking,
    ),
  });
}

/* ----------------------------- Technician actions ---------------------------- */

const nowIso = () => new Date().toISOString();

function makeNotification(
  kind: NotificationKind,
  title: string,
  body: string,
  href?: string,
): AppNotification {
  return {
    id: `ntf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    title,
    body,
    createdAt: nowIso(),
    read: false,
    href,
  };
}

function withBooking(state: DemoState, booking: Booking): DemoState {
  return {
    ...state,
    bookings: state.bookings.map((entry) =>
      entry.id === booking.id ? booking : entry,
    ),
  };
}

function workFor(state: DemoState, bookingId: string): JobWork {
  return state.jobWork[bookingId] ?? { done: [], evidence: {}, notes: "" };
}

function withWork(state: DemoState, bookingId: string, work: JobWork): DemoState {
  return { ...state, jobWork: { ...state.jobWork, [bookingId]: work } };
}

function transitionNotification(
  booking: Booking,
  next: BookingStatus,
): AppNotification | null {
  const href = `/bookings/${booking.id}`;
  switch (next) {
    case "accepted":
      return makeNotification(
        "booking",
        `${booking.reference} accepted`,
        `${TECHNICIAN.name} accepted your ${booking.serviceName} booking. This is a simulated update — no SMS was sent.`,
        href,
      );
    case "on_the_way":
      return makeNotification(
        "booking",
        `${TECHNICIAN.name} is on the way`,
        `Your technician has started the trip for ${booking.reference}. Directions and dispatch alerts are simulated in this demo.`,
        href,
      );
    case "arrived":
      return makeNotification(
        "booking",
        `${TECHNICIAN.name} has arrived`,
        `The technician marked arrival at your address for ${booking.reference}.`,
        href,
      );
    case "completed":
      return makeNotification(
        "booking",
        `${booking.reference} completed`,
        `Your ${booking.serviceName} visit is marked complete. The estimate is final in this demo.`,
        href,
      );
    default:
      return null;
  }
}

/**
 * Move a job through the workflow. Only transitions listed in
 * lib/job-workflow.ts are accepted; the customer's timeline is rebuilt from
 * the recorded timestamps so both portals always agree.
 */
export function transitionJob(bookingId: string, next: BookingStatus): void {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  if (!booking || isJobLocked(booking.status)) return;

  const claiming = booking.status === "requested";
  if (claiming) {
    // "Accept job" doubles as the demo dispatch assignment for a new request.
    if (next !== "accepted") return;
  } else if (!canTransition(booking.status, next)) {
    return;
  }

  const work = workFor(state, bookingId);
  if (next === "completed") {
    const outstanding = buildChecklist(booking.categoryId).filter(
      (item) => !work.done.includes(item.id),
    );
    if (outstanding.length > 0) return;
  }

  const now = nowIso();
  const stamps = stampsFromTimeline(booking.timeline);
  if (claiming) {
    stamps.assigned = stamps.assigned ?? now;
  } else if (!stamps[booking.status]) {
    stamps[booking.status] = now;
  }
  stamps[next] = now;

  const updated: Booking = {
    ...booking,
    status: next,
    technicianId: claiming
      ? (booking.technicianId ?? TECHNICIAN.id)
      : booking.technicianId,
    timeline: buildTimeline(next, stamps),
  };

  let nextState = withWork(withBooking(state, updated), bookingId, work);
  const notification = transitionNotification(booking, next);
  if (notification) {
    nextState = {
      ...nextState,
      notifications: [notification, ...nextState.notifications],
    };
  }
  commit(nextState);
}

/** Raise extra work for customer approval. Returns false when invalid. */
export function submitWorkQuote(
  bookingId: string,
  items: QuoteDraftItem[],
  note: string,
): boolean {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  if (!booking) return false;
  if (booking.status !== "in_progress" && booking.status !== "awaiting_approval") {
    return false;
  }

  const clean = items
    .map((item) => ({
      description: item.description.trim(),
      amount: Number(item.amount),
    }))
    .filter(
      (item) =>
        item.description.length > 0 &&
        Number.isFinite(item.amount) &&
        item.amount > 0,
    );
  if (clean.length === 0) return false;

  const now = nowIso();
  const work = workFor(state, bookingId);
  const quote: WorkQuote = {
    items: clean.map((item, index) => ({
      id: `quote-${Date.now().toString(36)}-${index}`,
      description: item.description,
      amount: Math.round(item.amount * 100) / 100,
    })),
    note: note.trim(),
    status: "pending",
    submittedAt: now,
  };

  const stamps = {
    ...stampsFromTimeline(booking.timeline),
    awaiting_approval: now,
  };
  const updated: Booking = {
    ...booking,
    status: "awaiting_approval",
    timeline: buildTimeline("awaiting_approval", stamps),
  };

  const total = quote.items.reduce((sum, item) => sum + item.amount, 0);
  commit({
    ...withWork(withBooking(state, updated), bookingId, { ...work, quote }),
    notifications: [
      makeNotification(
        "estimate",
        "Approval needed for extra work",
        `${TECHNICIAN.name} raised a ₹${total} quote on ${booking.reference}. Approve or decline it from the booking.`,
        `/bookings/${booking.id}`,
      ),
      ...state.notifications,
    ],
  });
  return true;
}

/** Customer-side decision on the pending quote (no payment is involved). */
export function decideWorkQuote(
  bookingId: string,
  decision: "approved" | "declined",
): void {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  if (!booking || booking.status !== "awaiting_approval") return;

  const work = workFor(state, bookingId);
  const quote = work.quote;
  if (!quote || quote.status !== "pending") return;

  const now = nowIso();
  const total = quote.items.reduce((sum, item) => sum + item.amount, 0);
  const decided: WorkQuote = {
    ...quote,
    status: decision,
    decidedAt: now,
  };

  const updated: Booking = {
    ...booking,
    status: "in_progress",
    timeline: buildTimeline("in_progress", stampsFromTimeline(booking.timeline), {
      in_progress:
        decision === "approved"
          ? `Customer approved ₹${total} of extra work — work continues`
          : "Customer declined the extra work — continuing with the original scope",
    }),
  };

  commit(
    withWork(withBooking(state, updated), bookingId, { ...work, quote: decided }),
  );
}

/** Completed jobs are read-only; their notes stay editable. */
export function setJobChecklistItem(
  bookingId: string,
  itemId: string,
  done: boolean,
): void {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  if (!booking || isJobLocked(booking.status)) return;

  const work = workFor(state, bookingId);
  const next = done
    ? Array.from(new Set([...work.done, itemId]))
    : work.done.filter((id) => id !== itemId);
  commit(withWork(state, bookingId, { ...work, done: next }));
}

export function attachJobEvidence(bookingId: string, slotId: string): void {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  if (!booking || isJobLocked(booking.status)) return;

  const work = workFor(state, bookingId);
  commit(
    withWork(state, bookingId, {
      ...work,
      evidence: { ...work.evidence, [slotId]: nowIso() },
    }),
  );
}

export function saveJobNotes(bookingId: string, notes: string): void {
  const state = getSnapshot();
  const work = workFor(state, bookingId);
  commit(withWork(state, bookingId, { ...work, notes }));
}

export function setTechnicianOnline(online: boolean): void {
  const state = getSnapshot();
  commit({ ...state, availability: { ...state.availability, online } });
}

export function toggleWorkingDay(day: number): void {
  const state = getSnapshot();
  const { workingDays } = state.availability;
  const next = workingDays.includes(day)
    ? workingDays.filter((entry) => entry !== day)
    : [...workingDays, day].sort((a, b) => a - b);
  commit({
    ...state,
    availability: { ...state.availability, workingDays: next },
  });
}

/* ------------------------------- Admin actions ------------------------------ */

export function setReportingRange(range: AdminRange): void {
  if (!REPORTING_RANGES.includes(range)) return;
  commit({ ...getSnapshot(), reportingRange: range });
}

/**
 * Assign or reassign a verified technician. A requested booking moves to
 * assigned; an active booking keeps its workflow and only changes hands.
 */
export function assignBookingTechnician(
  bookingId: string,
  technicianId: string,
): boolean {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  const technician = state.technicians.find(
    (entry) => entry.id === technicianId && entry.verification === "verified",
  );
  if (!booking || !technician || isJobLocked(booking.status)) return false;
  if (booking.technicianId === technicianId) return false;

  const firstAssignment = !booking.technicianId;
  const now = nowIso();
  const stamps = stampsFromTimeline(booking.timeline);
  const status: BookingStatus =
    booking.status === "requested" ? "assigned" : booking.status;
  stamps.assigned = firstAssignment ? now : (stamps.assigned ?? now);

  const updated: Booking = {
    ...booking,
    technicianId,
    status,
    timeline: buildTimeline(status, stamps, {
      assigned: firstAssignment
        ? `${technician.name} assigned by operations (demo dispatch)`
        : `Reassigned to ${technician.name} by operations (demo)`,
    }),
  };

  commit({
    ...withBooking(state, updated),
    notifications: [
      makeNotification(
        "booking",
        firstAssignment
          ? `${technician.name} assigned to ${booking.reference}`
          : `Technician changed for ${booking.reference}`,
        firstAssignment
          ? `${technician.name} will handle your ${booking.serviceName} visit. Dispatch is simulated in this demo.`
          : `Your booking is now with ${technician.name}. This reassignment is simulated in this demo.`,
        `/bookings/${booking.id}`,
      ),
      ...state.notifications,
    ],
  });
  return true;
}

/** Operations cancellation — recorded in the customer timeline. */
export function adminCancelBooking(bookingId: string, reason: string): boolean {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  if (!booking || isJobLocked(booking.status)) return false;

  const now = nowIso();
  const cleanReason = reason.trim() || "Cancelled by demo operations";
  const updated: Booking = {
    ...booking,
    status: "cancelled",
    timeline: buildTimeline(
      "cancelled",
      {
        requested:
          stampsFromTimeline(booking.timeline).requested ?? booking.createdAt,
        cancelled: now,
      },
      { cancelled: `Cancelled by operations — ${cleanReason}` },
    ),
  };

  commit({
    ...withBooking(state, updated),
    notifications: [
      makeNotification(
        "booking",
        `${booking.reference} cancelled`,
        `Operations cancelled this booking. Reason: ${cleanReason}. No money moves in this demo.`,
        `/bookings/${booking.id}`,
      ),
      ...state.notifications,
    ],
  });
  return true;
}

/** Admin completion override for work already in progress. */
export function adminCompleteBooking(bookingId: string): boolean {
  const state = getSnapshot();
  const booking = state.bookings.find((entry) => entry.id === bookingId);
  if (
    !booking ||
    (booking.status !== "in_progress" && booking.status !== "awaiting_approval")
  ) {
    return false;
  }

  const now = nowIso();
  const stamps = stampsFromTimeline(booking.timeline);
  stamps.in_progress = stamps.in_progress ?? now;
  stamps.completed = now;
  const updated: Booking = {
    ...booking,
    status: "completed",
    timeline: buildTimeline("completed", stamps, {
      completed: "Closed by operations after the visit (demo)",
    }),
  };

  commit({
    ...withBooking(state, updated),
    notifications: [
      makeNotification(
        "booking",
        `${booking.reference} closed by operations`,
        `Operations marked your ${booking.serviceName} visit complete. This is a simulated update.`,
        `/bookings/${booking.id}`,
      ),
      ...state.notifications,
    ],
  });
  return true;
}

/** Approve or reject a technician's simulated verification documents. */
export function decideTechnician(
  technicianId: string,
  decision: "verified" | "rejected",
  note = "",
): boolean {
  const state = getSnapshot();
  const technician = state.technicians.find((entry) => entry.id === technicianId);
  if (!technician || technician.verification === decision) return false;

  const documents: TechnicianDocument[] = technician.documents.map((document) => ({
    ...document,
    status:
      decision === "verified"
        ? "verified"
        : document.status === "pending"
          ? "rejected"
          : document.status,
  }));
  const cleanNote = note.trim();

  commit({
    ...state,
    technicians: state.technicians.map((entry) =>
      entry.id === technicianId
        ? {
            ...entry,
            verification: decision,
            verificationNote:
              cleanNote ||
              (decision === "verified"
                ? "Approved in demo operations. All placeholder documents are marked verified."
                : "Rejected in demo operations. Documents must be re-uploaded."),
            documents,
          }
        : entry,
    ),
  });
  return true;
}

export function assignDisputeOwner(caseId: string, owner: string | null): boolean {
  if (
    owner !== null &&
    !(ADMIN_TEAM as readonly string[]).includes(owner)
  ) {
    return false;
  }
  const state = getSnapshot();
  const dispute = state.disputes.find((entry) => entry.id === caseId);
  if (!dispute || dispute.owner === owner) return false;
  commit({
    ...state,
    disputes: state.disputes.map((entry) =>
      entry.id === caseId ? { ...entry, owner } : entry,
    ),
  });
  return true;
}

/** Internal notes never leave the admin portal. */
export function addDisputeInternalNote(caseId: string, body: string): boolean {
  const clean = body.trim();
  if (!clean) return false;
  const state = getSnapshot();
  const dispute = state.disputes.find((entry) => entry.id === caseId);
  if (!dispute) return false;

  commit({
    ...state,
    disputes: state.disputes.map((entry) =>
      entry.id === caseId
        ? {
            ...entry,
            internalNotes: [
              {
                id: `note-${Date.now().toString(36)}`,
                body: clean,
                at: nowIso(),
                author: ADMIN_PROFILE.name,
              },
              ...entry.internalNotes,
            ],
          }
        : entry,
    ),
  });
  return true;
}

export function startDisputeInvestigation(caseId: string): boolean {
  const state = getSnapshot();
  const dispute = state.disputes.find((entry) => entry.id === caseId);
  if (!dispute || dispute.status !== "open") return false;

  const update: DisputeUpdate = {
    id: `upd-${Date.now().toString(36)}`,
    body: "Your case is now being investigated by our operations team.",
    at: nowIso(),
    author: ADMIN_PROFILE.name,
  };

  commit({
    ...state,
    disputes: state.disputes.map((entry) =>
      entry.id === caseId
        ? {
            ...entry,
            status: "investigating",
            customerUpdates: [...entry.customerUpdates, update],
          }
        : entry,
    ),
  });
  return true;
}

/**
 * Resolution text is customer-facing. Internal notes stay untouched, and the
 * customer receives a notification with only this resolution.
 */
export function resolveDispute(caseId: string, resolution: string): boolean {
  const clean = resolution.trim();
  if (!clean) return false;
  const state = getSnapshot();
  const dispute = state.disputes.find((entry) => entry.id === caseId);
  if (!dispute || dispute.status === "resolved") return false;

  const now = nowIso();
  const update: DisputeUpdate = {
    id: `upd-${Date.now().toString(36)}`,
    body: `Case resolved — ${clean}`,
    at: now,
    author: ADMIN_PROFILE.name,
  };

  commit({
    ...state,
    disputes: state.disputes.map((entry) =>
      entry.id === caseId
        ? {
            ...entry,
            status: "resolved",
            resolution: clean,
            resolvedAt: now,
            customerUpdates: [...entry.customerUpdates, update],
          }
        : entry,
    ),
    notifications: [
      makeNotification(
        "system",
        `Case ${dispute.reference} resolved`,
        clean,
        "/support",
      ),
      ...state.notifications,
    ],
  });
  return true;
}

/** Add or update a catalogue record (admin demo data only). */
export function saveCatalogEntry(entry: CatalogEntry): void {
  const state = getSnapshot();
  const exists = state.catalog.some((item) => item.slug === entry.slug);
  commit({
    ...state,
    catalog: exists
      ? state.catalog.map((item) =>
          item.slug === entry.slug ? { ...entry, updatedAt: nowIso() } : item,
        )
      : [{ ...entry, updatedAt: nowIso() }, ...state.catalog],
  });
}

export function setCatalogStatus(slug: string, status: CatalogStatus): void {
  const state = getSnapshot();
  commit({
    ...state,
    catalog: state.catalog.map((entry) =>
      entry.slug === slug
        ? { ...entry, status, updatedAt: nowIso() }
        : entry,
    ),
  });
}

export function markNotificationRead(id: string) {
  const state = getSnapshot();
  commit({
    ...state,
    notifications: state.notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    ),
  });
}

export function markAllNotificationsRead() {
  const state = getSnapshot();
  commit({
    ...state,
    notifications: state.notifications.map((notification) =>
      notification.read ? notification : { ...notification, read: true },
    ),
  });
}

export function updateProfile(patch: Partial<UserProfile>) {
  const state = getSnapshot();
  commit({ ...state, profile: { ...state.profile, ...patch } });
}

export function addAddress(address: Omit<Address, "id">): Address {
  const state = getSnapshot();
  const created: Address = {
    ...address,
    id: `addr-${Date.now().toString(36)}`,
  };
  commit({ ...state, addresses: [...state.addresses, created] });
  return created;
}

export function setLocation(locationId: DemoState["locationId"]) {
  commit({ ...getSnapshot(), locationId });
}

export function signOut() {
  commit({ ...getSnapshot(), signedOut: true });
}

export function signIn() {
  commit({ ...getSnapshot(), signedOut: false });
}

export function resetDemo() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  current = buildSeedState();
  persist(current);
  listeners.forEach((listener) => listener());
}
