/**
 * Job workflow — the single source of truth for valid technician transitions
 * and for the timeline the customer portal renders.
 *
 * This is a frontend demo: the "state machine" lives in lib/demo-store.ts and
 * only guards the UI. No server enforces any of it.
 */
import type { BookingStatus, TimelineStep } from "./types";

/** Customer-facing milestones, in order. `awaiting_approval` is inserted later. */
export const JOB_FLOW: BookingStatus[] = [
  "requested",
  "assigned",
  "accepted",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
];

export const JOB_STEP_NOTES: Record<BookingStatus, string> = {
  requested: "The booking request is waiting for dispatch",
  assigned: "A technician from the demo team is assigned",
  accepted: "Your technician accepted the job",
  on_the_way: "The technician is travelling to your address",
  arrived: "The technician has arrived at your address",
  in_progress: "Work has started at your address",
  awaiting_approval: "Extra work is waiting for your approval",
  completed: "The job is marked complete and the estimate is final",
  cancelled: "The booking was cancelled before completion",
};

/** Valid next states. Anything not listed here is not offered by the UI. */
export const JOB_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  // Dispatch assigns the booking, which the demo technician claims directly.
  requested: ["assigned"],
  assigned: ["accepted"],
  accepted: ["on_the_way"],
  on_the_way: ["arrived"],
  arrived: ["in_progress"],
  in_progress: ["awaiting_approval", "completed"],
  awaiting_approval: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return (JOB_TRANSITIONS[from] ?? []).includes(to);
}

interface NextJobAction {
  status: BookingStatus;
  label: string;
  helper: string;
}

/** The one dominant action for each technician-facing state. */
export const NEXT_JOB_ACTION: Partial<Record<BookingStatus, NextJobAction>> = {
  assigned: {
    status: "accepted",
    label: "Accept job",
    helper: "Confirm you're taking this visit.",
  },
  accepted: {
    status: "on_the_way",
    label: "Start trip",
    helper: "Let the customer know you're on the way.",
  },
  on_the_way: {
    status: "arrived",
    label: "I've arrived",
    helper: "Records your arrival at the address.",
  },
  arrived: {
    status: "in_progress",
    label: "Start work",
    helper: "Starts the job and unlocks the checklist.",
  },
  in_progress: {
    status: "completed",
    label: "Complete job",
    helper: "Available once every checklist item is done.",
  },
};

/** Statuses shown in the technician job lists (cancelled/requested excluded). */
export function isAssignedJob(status: BookingStatus): boolean {
  return (
    status === "assigned" ||
    status === "accepted" ||
    status === "on_the_way" ||
    status === "arrived" ||
    status === "in_progress" ||
    status === "awaiting_approval" ||
    status === "completed"
  );
}

/** Completed jobs are read-only except for post-job notes. */
export function isJobLocked(status: BookingStatus): boolean {
  return status === "completed" || status === "cancelled";
}

export function stampsFromTimeline(
  timeline: TimelineStep[],
): Partial<Record<BookingStatus, string>> {
  const stamps: Partial<Record<BookingStatus, string>> = {};
  for (const step of timeline) {
    if (step.at) stamps[step.status] = step.at;
  }
  return stamps;
}

/**
 * Rebuild the timeline for a status from the timestamps already recorded, so
 * the customer portal always sees the same history the technician created.
 */
export function buildTimeline(
  status: BookingStatus,
  stamps: Partial<Record<BookingStatus, string>>,
  noteOverrides?: Partial<Record<BookingStatus, string>>,
): TimelineStep[] {
  if (status === "cancelled") {
    return [
      {
        status: "requested",
        note: noteOverrides?.requested ?? JOB_STEP_NOTES.requested,
        at: stamps.requested,
      },
      {
        status: "cancelled",
        note: noteOverrides?.cancelled ?? JOB_STEP_NOTES.cancelled,
        at: stamps.cancelled,
      },
    ];
  }

  const order: BookingStatus[] =
    status === "awaiting_approval"
      ? [...JOB_FLOW.slice(0, 6), "awaiting_approval", "completed"]
      : JOB_FLOW;

  const current = order.indexOf(status);

  return order.map((step, index) => {
    const note = noteOverrides?.[step] ?? JOB_STEP_NOTES[step];
    return index <= current
      ? { status: step, note, at: stamps[step] }
      : { status: step, note };
  });
}
