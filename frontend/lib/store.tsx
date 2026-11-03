"use client";

/**
 * React binding for the demo external store (see lib/demo-store.ts).
 * Components read the same state and actions regardless of where they sit.
 */
import { useMemo, useSyncExternalStore } from "react";
import {
  addAddress,
  cancelBooking,
  createBooking,
  getServerSnapshot,
  getSnapshot,
  markAllNotificationsRead,
  markNotificationRead,
  resetDemo,
  setLocation,
  signIn,
  signOut,
  subscribe,
  updateProfile,
  type BookingDraft,
  type DemoState,
} from "./demo-store";
import { DEMO_LOCATIONS } from "./mock-data";
import type { Address, Booking, UserProfile } from "./types";

function isUpcoming(booking: Booking): boolean {
  return (
    booking.status === "requested" ||
    booking.status === "assigned" ||
    booking.status === "on_the_way" ||
    booking.status === "in_progress"
  );
}

export interface DemoStoreValue extends DemoState {
  location: (typeof DEMO_LOCATIONS)[number];
  unreadCount: number;
  upcomingBookings: Booking[];
  createBooking: (draft: BookingDraft) => Booking;
  cancelBooking: (bookingId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  addAddress: (address: Omit<Address, "id">) => Address;
  setLocation: (id: DemoState["locationId"]) => void;
  signOut: () => void;
  signIn: () => void;
  resetDemo: () => void;
}

export function useDemoStore(): DemoStoreValue {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(
    () => ({
      ...state,
      location:
        DEMO_LOCATIONS.find((entry) => entry.id === state.locationId) ??
        DEMO_LOCATIONS[0],
      unreadCount: state.notifications.filter((n) => !n.read).length,
      upcomingBookings: state.bookings
        .filter(isUpcoming)
        .sort((a, b) => a.date.localeCompare(b.date)),
      createBooking,
      cancelBooking,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      addAddress,
      setLocation,
      signOut,
      signIn,
      resetDemo,
    }),
    [state],
  );
}
