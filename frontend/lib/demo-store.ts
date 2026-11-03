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
  createSeedNotifications,
  getServiceBySlug,
} from "./mock-data";
import { buildEstimate } from "./pricing";
import { formatDate } from "./format";
import type {
  Address,
  AppNotification,
  Booking,
  PaymentPreference,
  TimelineStep,
  UserProfile,
} from "./types";

const STORAGE_KEY = "fixora:demo:v1";

export interface DemoState {
  profile: UserProfile;
  addresses: Address[];
  bookings: Booking[];
  notifications: AppNotification[];
  locationId: (typeof DEMO_LOCATIONS)[number]["id"];
  signedOut: boolean;
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

const FLOW_STEPS: TimelineStep[] = [
  { status: "requested", note: "We received your booking request" },
  { status: "assigned", note: "A technician from the demo team is assigned" },
  { status: "on_the_way", note: "The technician is travelling to your address" },
  { status: "in_progress", note: "Work has started at your address" },
  { status: "completed", note: "The job is marked complete and the estimate is final" },
];

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
    hydrated: true,
  };
}

function readPersisted(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as (Partial<DemoState> & { v?: number }) | null;
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.bookings)) return null;
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
        v: 1,
        profile: state.profile,
        addresses: state.addresses,
        bookings: state.bookings,
        notifications: state.notifications,
        locationId: state.locationId,
        signedOut: state.signedOut,
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
    timeline: FLOW_STEPS.map((step, index) =>
      index === 0 ? { ...step, at: now } : step,
    ),
    createdAt: now,
  };

  commit({
    ...state,
    bookings: [booking, ...state.bookings],
    notifications: [
      {
        id: `ntf-${Date.now().toString(36)}`,
        kind: "booking",
        title: `Booking ${booking.reference} requested`,
        body: `Your ${service.name} request for ${formatDate(
          booking.date,
        )} (${booking.slot}) has been received. We'll assign a technician shortly.`,
        createdAt: now,
        read: false,
        href: `/bookings/${booking.id}`,
      },
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
