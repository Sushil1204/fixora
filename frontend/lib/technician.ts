/**
 * Technician portal domain helpers.
 *
 * Everything here is fictional demo content: one technician, a fixed checklist
 * per service category, simulated photo slots, and illustrative earnings maths.
 */
import type {
  Booking,
  JobChecklistItem,
  JobEvidenceSlot,
  JobWork,
  JobWorkMap,
  ServiceCategoryId,
  WorkQuote,
} from "./types";

export const TECHNICIAN = {
  id: "tech-1",
  name: "Ravi Kumar",
  shortName: "Ravi",
  initials: "RK",
  phone: "+91 90000 12345",
  rating: "4.8",
  jobsCompleted: 312,
  yearsExperience: 6,
  skills: ["plumbing", "electrical"] as ServiceCategoryId[],
  coverage: ["Koramangala", "Indiranagar", "HSR Layout", "Marathahalli"],
  workWindow: "8 AM – 8 PM",
  memberSince: "2024",
  technicianCode: "TECH-1042",
  verification:
    "Demo verification badge — identity, police and skill checks are simulated for this product demonstration.",
} as const;

/**
 * Ravi's demo work queue: jobs assigned to him plus unclaimed customer
 * requests. Jobs dispatched to another technician stay out of his portal.
 */
export function belongsToTechnician(
  booking: Pick<Booking, "technicianId">,
  technicianId: string = TECHNICIAN.id,
): boolean {
  return !booking.technicianId || booking.technicianId === technicianId;
}

/** Illustrative platform commission on completed work. */
export const DEMO_COMMISSION_RATE = 0.18;

/** Completed jobs settle after this many days (demo rule). */
export const SETTLEMENT_DAYS = 7;

export const WEEKDAYS = [
  { day: 1, short: "Mon" },
  { day: 2, short: "Tue" },
  { day: 3, short: "Wed" },
  { day: 4, short: "Thu" },
  { day: 5, short: "Fri" },
  { day: 6, short: "Sat" },
  { day: 0, short: "Sun" },
] as const;

const CHECKLIST_COPY: Record<
  ServiceCategoryId,
  { setup: string; test: string }
> = {
  plumbing: {
    setup: "Lay a protective sheet and shut off the water supply",
    test: "Run water through the fixture and check every joint for leaks",
  },
  electrical: {
    setup: "Switch off the circuit at the MCB before opening any plate",
    test: "Test the point with the customer's own appliance",
  },
  "ac-repair": {
    setup: "Lay floor protection and confirm the indoor unit is powered off",
    test: "Run a cooling test and record the vent temperature",
  },
  "appliance-repair": {
    setup: "Unplug the appliance and protect the floor around it",
    test: "Run a full cycle and confirm the reported fault is gone",
  },
  carpentry: {
    setup: "Cover the floor and check the wall type before drilling",
    test: "Open, close and load-test the fitting with the customer",
  },
  "mobile-repair": {
    setup: "Back up the device and use an anti-static mat",
    test: "Test charging, buttons and data transfer before hand-back",
  },
};

/** Required pre/post work items for the booking's category. */
export function buildChecklist(categoryId: ServiceCategoryId): JobChecklistItem[] {
  const copy = CHECKLIST_COPY[categoryId];
  return [
    {
      id: "pre-call",
      phase: "pre",
      label: "Call the customer before you leave for the address",
    },
    {
      id: "pre-confirm",
      phase: "pre",
      label: "Confirm the reported issue with the customer on arrival",
    },
    { id: "pre-setup", phase: "pre", label: copy.setup },
    { id: "post-test", phase: "post", label: copy.test },
    {
      id: "post-clean",
      phase: "post",
      label: "Clean the work area and take away packing waste",
    },
    {
      id: "post-handover",
      phase: "post",
      label: "Explain the fix and share the estimate breakdown",
    },
  ];
}

/** Simulated photo slots. Nothing is captured or uploaded. */
export const EVIDENCE_SLOTS: JobEvidenceSlot[] = [
  { id: "before", label: "Before photo", hint: "The reported issue" },
  { id: "part", label: "Part photo", hint: "Replaced part or serial" },
  { id: "after", label: "After photo", hint: "Finished work" },
];

export const EMPTY_JOB_WORK: JobWork = {
  done: [],
  evidence: {},
  notes: "",
};

export function quoteTotal(quote: WorkQuote): number {
  return quote.items.reduce((sum, item) => sum + item.amount, 0);
}

/** Extra work the customer approved; only approved amounts affect payouts. */
export function approvedExtra(work?: JobWork): number {
  if (!work?.quote || work.quote.status !== "approved") return 0;
  return quoteTotal(work.quote);
}

/** Service charge for the job plus approved extra work (technician gross). */
export function jobGross(booking: Booking, work?: JobWork): number {
  const serviceCharge =
    booking.estimate.lines.find((line) => line.kind === "charge")?.amount ?? 0;
  return serviceCharge + approvedExtra(work);
}

/** Illustrative net payout after the demo commission. */
export function jobPayout(booking: Booking, work?: JobWork): number {
  const gross = jobGross(booking, work);
  return gross - Math.round(gross * DEMO_COMMISSION_RATE);
}

export interface EarningsEntry {
  booking: Booking;
  gross: number;
  commission: number;
  payout: number;
  extra: number;
  completedAt?: string;
  settled: boolean;
}

export interface EarningsSummary {
  entries: EarningsEntry[];
  completedCount: number;
  gross: number;
  commission: number;
  payout: number;
  extra: number;
  pendingPayout: number;
  paidPayout: number;
}

export function completedAtIso(booking: Booking): string | undefined {
  return [...booking.timeline]
    .reverse()
    .find((step) => step.status === "completed" && step.at)?.at;
}

/**
 * Illustrative earnings from completed jobs only. `now` is injectable so the
 * numbers stay testable; the UI always calls it on the client.
 */
export function computeEarnings(
  bookings: Booking[],
  jobWork: JobWorkMap,
  now: number = Date.now(),
): EarningsSummary {
  const entries: EarningsEntry[] = bookings
    .filter((booking) => booking.status === "completed")
    .sort((a, b) => (completedAtIso(b) ?? "").localeCompare(completedAtIso(a) ?? ""))
    .map((booking) => {
      const work = jobWork[booking.id];
      const gross = jobGross(booking, work);
      const commission = Math.round(gross * DEMO_COMMISSION_RATE);
      const completedAt = completedAtIso(booking);
      const settled =
        Boolean(completedAt) &&
        now - new Date(completedAt as string).getTime() >
          SETTLEMENT_DAYS * 86400000;
      return {
        booking,
        gross,
        commission,
        payout: gross - commission,
        extra: approvedExtra(work),
        completedAt,
        settled,
      };
    });

  const sum = (pick: (entry: EarningsEntry) => number) =>
    entries.reduce((total, entry) => total + pick(entry), 0);

  return {
    entries,
    completedCount: entries.length,
    gross: sum((entry) => entry.gross),
    commission: sum((entry) => entry.commission),
    payout: sum((entry) => entry.payout),
    extra: sum((entry) => entry.extra),
    pendingPayout: sum((entry) => (entry.settled ? 0 : entry.payout)),
    paidPayout: sum((entry) => (entry.settled ? entry.payout : 0)),
  };
}

/**
 * Stable, fictional distance for a booking. Used only to dress the demo
 * navigation affordance — there is no maps integration.
 */
export function demoDistance(booking: Booking): { km: string; mins: number } {
  const seed = booking.reference
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return {
    km: (1.2 + (seed % 18) / 10).toFixed(1),
    mins: 6 + (seed % 14),
  };
}

/** "2.4 km" without the demo label, for compact meta rows. */
export function distanceLabel(booking: Booking): string {
  return `${demoDistance(booking).km} km`;
}
