"use client";

/**
 * React binding for the demo external store (see lib/demo-store.ts).
 * Components read the same state and actions regardless of where they sit.
 */
import { useMemo, useSyncExternalStore } from "react";
import {
  addAddress,
  addDisputeInternalNote,
  adminCancelBooking,
  adminCompleteBooking,
  assignBookingTechnician,
  assignDisputeOwner,
  attachJobEvidence,
  cancelBooking,
  createBooking,
  decideTechnician,
  decideWorkQuote,
  getServerSnapshot,
  getSnapshot,
  markAllNotificationsRead,
  markNotificationRead,
  resetDemo,
  resolveDispute,
  saveCatalogEntry,
  saveJobNotes,
  setCatalogStatus,
  setJobChecklistItem,
  setLocation,
  setReportingRange,
  setTechnicianOnline,
  signIn,
  signOut,
  startDisputeInvestigation,
  submitWorkQuote,
  subscribe,
  toggleWorkingDay,
  transitionJob,
  updateProfile,
  type BookingDraft,
  type DemoState,
  type QuoteDraftItem,
} from "./demo-store";
import { DEMO_LOCATIONS } from "./mock-data";
import type {
  Address,
  AdminRange,
  Booking,
  BookingStatus,
  CatalogEntry,
  CatalogStatus,
  UserProfile,
} from "./types";

function isUpcoming(booking: Booking): boolean {
  return (
    booking.status === "requested" ||
    booking.status === "assigned" ||
    booking.status === "accepted" ||
    booking.status === "on_the_way" ||
    booking.status === "arrived" ||
    booking.status === "in_progress" ||
    booking.status === "awaiting_approval"
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
  transitionJob: (bookingId: string, next: BookingStatus) => void;
  submitWorkQuote: (
    bookingId: string,
    items: QuoteDraftItem[],
    note: string,
  ) => boolean;
  decideWorkQuote: (
    bookingId: string,
    decision: "approved" | "declined",
  ) => void;
  setJobChecklistItem: (
    bookingId: string,
    itemId: string,
    done: boolean,
  ) => void;
  attachJobEvidence: (bookingId: string, slotId: string) => void;
  saveJobNotes: (bookingId: string, notes: string) => void;
  setTechnicianOnline: (online: boolean) => void;
  toggleWorkingDay: (day: number) => void;
  setReportingRange: (range: AdminRange) => void;
  assignBookingTechnician: (bookingId: string, technicianId: string) => boolean;
  adminCancelBooking: (bookingId: string, reason: string) => boolean;
  adminCompleteBooking: (bookingId: string) => boolean;
  decideTechnician: (
    technicianId: string,
    decision: "verified" | "rejected",
    note?: string,
  ) => boolean;
  assignDisputeOwner: (caseId: string, owner: string | null) => boolean;
  addDisputeInternalNote: (caseId: string, body: string) => boolean;
  startDisputeInvestigation: (caseId: string) => boolean;
  resolveDispute: (caseId: string, resolution: string) => boolean;
  saveCatalogEntry: (entry: CatalogEntry) => void;
  setCatalogStatus: (slug: string, status: CatalogStatus) => void;
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
      transitionJob,
      submitWorkQuote,
      decideWorkQuote,
      setJobChecklistItem,
      attachJobEvidence,
      saveJobNotes,
      setTechnicianOnline,
      toggleWorkingDay,
      setReportingRange,
      assignBookingTechnician,
      adminCancelBooking,
      adminCompleteBooking,
      decideTechnician,
      assignDisputeOwner,
      addDisputeInternalNote,
      startDisputeInvestigation,
      resolveDispute,
      saveCatalogEntry,
      setCatalogStatus,
    }),
    [state],
  );
}
