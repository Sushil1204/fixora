/**
 * Fixora mock-data layer — fictional demo content only.
 * No real people, addresses, or phone numbers. No network calls.
 */
import { upcomingDates } from "./format";
import { buildEstimate } from "./pricing";
import type {
  Address,
  AppNotification,
  Booking,
  BookingStatus,
  Service,
  ServiceCategory,
  TimeSlot,
  TimelineStep,
  UserProfile,
} from "./types";

export const DEMO_LOCATIONS = [
  { id: "koramangala", city: "Bengaluru", area: "Koramangala" },
  { id: "indiranagar", city: "Bengaluru", area: "Indiranagar" },
  { id: "bandra", city: "Mumbai", area: "Bandra West" },
  { id: "gurgaon", city: "Delhi NCR", area: "Gurugram" },
  { id: "gachibowli", city: "Hyderabad", area: "Gachibowli" },
] as const;

export const TIME_SLOTS: TimeSlot[] = [
  { id: "08:00", label: "8 AM – 10 AM" },
  { id: "10:00", label: "10 AM – 12 PM" },
  { id: "12:00", label: "12 PM – 2 PM" },
  { id: "14:00", label: "2 PM – 4 PM" },
  { id: "16:00", label: "4 PM – 6 PM" },
  { id: "18:00", label: "6 PM – 8 PM" },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Taps, leaks, drains and fixtures",
    icon: "droplet",
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Switches, sockets, fans and wiring",
    icon: "zap",
  },
  {
    id: "ac-repair",
    name: "AC Repair",
    description: "Servicing, cleaning and diagnostics",
    icon: "wind",
  },
  {
    id: "appliance-repair",
    name: "Appliance Repair",
    description: "Fridge, washing machine, chimney",
    icon: "refrigerator",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    description: "Doors, locks, furniture and fittings",
    icon: "hammer",
  },
  {
    id: "mobile-repair",
    name: "Mobile Repair",
    description: "Charging ports, screens and batteries",
    icon: "smartphone",
  },
];

const STANDARD_CANCELLATION =
  "Free cancellation up to 4 hours before the visit. After a technician is assigned, a ₹99 cancellation fee applies. Rescheduling is free until the technician is on the way.";

const STANDARD_WARRANTY =
  "30 days on service labour. Replacement parts carry the manufacturer's warranty, and a repeat visit for the same issue within the warranty window is free.";

const COMMON_EXCLUSIONS = [
  "Replacement parts and consumables (quoted separately after inspection)",
  "Structural, concealed piping or concealed wiring work",
];

const STANDARD_ADDITIONAL_CHARGES = [
  {
    item: "Replacement parts",
    note: "Quoted after inspection and only after your approval",
  },
  {
    item: "Extra labour beyond the estimated duration",
    note: "₹150 per additional 30 minutes, only after your approval",
  },
];

export const SERVICES: Service[] = [
  {
    slug: "tap-faucet-repair",
    name: "Tap & faucet repair",
    categoryId: "plumbing",
    shortDescription:
      "Fix dripping taps, loose faucets and low water pressure at the source.",
    startPrice: 499,
    durationMins: 45,
    popular: true,
    includedWork: [
      "Inspection of the tap, valve and supply lines",
      "Replacement of worn washers, O-rings and cartridges (labour only)",
      "Re-seating and tightening of the fixture",
      "A quick function test before the technician leaves",
    ],
    exclusions: COMMON_EXCLUSIONS,
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "sink-drain-unclogging",
    name: "Sink & drain unclogging",
    categoryId: "plumbing",
    shortDescription:
      "Clear blocked kitchen sinks, wash basins and floor drains.",
    startPrice: 549,
    durationMins: 45,
    popular: false,
    includedWork: [
      "Diagnosis of the blockage point",
      "Manual removal of hair, food residue and grease build-up",
      "Trap cleaning and re-sealing",
      "Flow test after clearing",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Excavation or replacement of buried drainage lines",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "leakage-inspection-fix",
    name: "Leakage inspection & fix",
    categoryId: "plumbing",
    shortDescription:
      "Trace visible leaks in bathrooms, kitchens and balconies.",
    startPrice: 599,
    durationMins: 60,
    popular: false,
    includedWork: [
      "Visual and pressure-based leak trace",
      "Repair of accessible joints, seals and connectors",
      "Sealant application around fixtures",
      "A short re-test to confirm the leak has stopped",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Breaking tiles or walls to reach concealed pipes (quoted on site)",
    ],
    additionalCharges: [
      {
        item: "Concealed pipe access",
        note: "Requires a written quote and your approval before any cutting",
      },
      ...STANDARD_ADDITIONAL_CHARGES,
    ],
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "switch-socket-repair",
    name: "Switch & socket repair",
    categoryId: "electrical",
    shortDescription:
      "Repair or replace faulty switches, sockets and plug points.",
    startPrice: 399,
    durationMins: 30,
    popular: true,
    includedWork: [
      "Power-safe inspection of the point",
      "Replacement of a faulty switch or socket (standard grade)",
      "Tightening of loose connections in the plate",
      "A load test with your appliances",
    ],
    exclusions: COMMON_EXCLUSIONS,
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "fan-repair-installation",
    name: "Fan repair & installation",
    categoryId: "electrical",
    shortDescription:
      "Ceiling and exhaust fans: installation, wobble, noise and speed issues.",
    startPrice: 449,
    durationMins: 45,
    popular: false,
    includedWork: [
      "Inspection of the fan, regulator and wiring at the point",
      "Installation or removal of a ceiling/exhaust fan",
      "Balancing, tightening and alignment",
      "Speed and direction test",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Fan regulator or remote replacement parts",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "inverter-mcb-issues",
    name: "Inverter & MCB issues",
    categoryId: "electrical",
    shortDescription:
      "Diagnose tripping MCBs, inverter charging faults and power cuts.",
    startPrice: 599,
    durationMins: 60,
    popular: false,
    includedWork: [
      "Inspection of the distribution board and MCBs",
      "Inverter/UPS charging and output diagnosis",
      "Loose connection and overload checks",
      "A written summary of what was found",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Inverter battery replacement",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "ac-service-deep-clean",
    name: "AC service & deep clean",
    categoryId: "ac-repair",
    shortDescription:
      "Split or window AC: coil cleaning, gas pressure check and cooling test.",
    startPrice: 899,
    durationMins: 60,
    popular: true,
    includedWork: [
      "Filter, coil and drain tray cleaning",
      "Gas pressure and cooling performance check",
      "Thermostat and remote settings check",
      "A cooling test at the end of the visit",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Gas refilling (quoted separately after pressure check)",
    ],
    additionalCharges: [
      {
        item: "Gas refilling",
        note: "Priced by gas type and quoted for your approval",
      },
      ...STANDARD_ADDITIONAL_CHARGES,
    ],
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "ac-not-cooling-diagnosis",
    name: "AC not cooling diagnosis",
    categoryId: "ac-repair",
    shortDescription:
      "Find out why the AC runs but doesn't cool — diagnosed on the spot.",
    startPrice: 699,
    durationMins: 45,
    popular: false,
    includedWork: [
      "Compressor, capacitor and thermostat diagnosis",
      "Airflow and refrigerant pressure check",
      "Explanation of the fault and recommended fix",
      "Cooling test after minor adjustments",
    ],
    exclusions: COMMON_EXCLUSIONS,
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "fridge-repair",
    name: "Refrigerator repair",
    categoryId: "appliance-repair",
    shortDescription:
      "Not cooling, leaking or noisy fridges — diagnosed and repaired at home.",
    startPrice: 799,
    durationMins: 60,
    popular: false,
    includedWork: [
      "Cooling, compressor and thermostat diagnosis",
      "Door gasket and drain channel check",
      "Repair of accessible electrical faults",
      "A temperature read-out before the visit ends",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Compressor or PCB replacement",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "washing-machine-repair",
    name: "Washing machine repair",
    categoryId: "appliance-repair",
    shortDescription:
      "Front and top-load machines: drain faults, spin issues and leaks.",
    startPrice: 749,
    durationMins: 60,
    popular: true,
    includedWork: [
      "Drain, inlet and spin cycle diagnosis",
      "Belt, pump and door lock inspection",
      "Repair of accessible faults",
      "A full test cycle after the repair",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Motor or control board replacement",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "chimney-microwave-service",
    name: "Chimney & microwave service",
    categoryId: "appliance-repair",
    shortDescription:
      "Deep-clean kitchen chimneys and service microwaves at home.",
    startPrice: 649,
    durationMins: 45,
    popular: false,
    includedWork: [
      "Chimney filter and hood degreasing",
      "Suction and lighting test",
      "Microwave turntable and cavity inspection",
      "Outer-body and vent cleaning",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Charcoal filter replacement",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "door-lock-repair",
    name: "Door & lock repair",
    categoryId: "carpentry",
    shortDescription:
      "Sticking doors, loose hinges and jammed locks fixed on the spot.",
    startPrice: 549,
    durationMins: 45,
    popular: false,
    includedWork: [
      "Alignment and hinge inspection",
      "Tightening or replacement of standard hinges",
      "Lock and latch adjustment",
      "Smooth-open test after the fix",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Change of lock body or smart-lock hardware",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "furniture-assembly-fixing",
    name: "Furniture assembly & fixing",
    categoryId: "carpentry",
    shortDescription:
      "Assemble flat-pack furniture or stabilise wobbly shelves and racks.",
    startPrice: 499,
    durationMins: 60,
    popular: false,
    includedWork: [
      "Assembly of one standard furniture unit",
      "Wall anchoring of shelves and racks (standard plugs)",
      "Tightening of joints, cam locks and fittings",
      "Stability check before completion",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Concrete-wall drilling beyond 4 anchor points",
    ],
    additionalCharges: STANDARD_ADDITIONAL_CHARGES,
    cancellationPolicy: STANDARD_CANCELLATION,
    warrantySummary: STANDARD_WARRANTY,
  },
  {
    slug: "phone-charging-port-repair",
    name: "Phone charging port repair",
    categoryId: "mobile-repair",
    shortDescription:
      "Loose or dead charging ports diagnosed and repaired on your device.",
    startPrice: 1299,
    durationMins: 45,
    popular: false,
    includedWork: [
      "Port, cable and adapter diagnosis",
      "Cleaning or replacement of the charging flex (standard grade)",
      "Charging and data transfer test",
      "Function check before hand-back",
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      "Screen, battery or motherboard damage found during the visit",
    ],
    additionalCharges: [
      {
        item: "Original-equipment port",
        note: "Quoted for your approval if you prefer it over standard grade",
      },
      ...STANDARD_ADDITIONAL_CHARGES,
    ],
    cancellationPolicy:
      "Free cancellation up to 4 hours before the visit. Once a device part is reserved for you, the part cost becomes payable. Rescheduling is free until the technician is on the way.",
    warrantySummary:
      "90 days on repair labour and 60 days on the replacement part (demo terms). Back up your device before the visit — data loss is excluded.",
  },
];

export const DEMO_PROFILE: UserProfile = {
  name: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  phone: "+91 98765 43210",
};

export const DEMO_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    line1: "402, Shanti Heights",
    line2: "5th Block, Koramangala",
    city: "Bengaluru",
    pincode: "560095",
    phone: "+91 98765 43210",
  },
  {
    id: "addr-2",
    label: "Work",
    line1: "12th Floor, Prestige Tech Park",
    line2: "Marathahalli, Outer Ring Road",
    city: "Bengaluru",
    pincode: "560103",
    phone: "+91 98765 43210",
  },
];

/* ---------------------------------- Bookings --------------------------------- */

const FULL_FLOW: TimelineStep[] = [
  {
    status: "requested",
    note: "We received your booking request",
    at: undefined,
  },
  {
    status: "assigned",
    note: "A technician from the demo team is assigned",
    at: undefined,
  },
  {
    status: "on_the_way",
    note: "The technician is travelling to your address",
    at: undefined,
  },
  {
    status: "in_progress",
    note: "Work has started at your address",
    at: undefined,
  },
  {
    status: "completed",
    note: "The job is marked complete and the estimate is final",
    at: undefined,
  },
];

function timelineUpTo(
  status: BookingStatus,
  timestamps: Partial<Record<BookingStatus, string>>,
): TimelineStep[] {
  const order: BookingStatus[] = [
    "requested",
    "assigned",
    "on_the_way",
    "in_progress",
    "completed",
  ];
  if (status === "cancelled") {
    return [
      { ...FULL_FLOW[0], at: timestamps.requested },
      {
        status: "cancelled",
        note: "The booking was cancelled before completion",
        at: timestamps.cancelled,
      },
    ];
  }
  const reached = order.indexOf(status);
  return FULL_FLOW.map((step, i) =>
    i <= reached ? { ...step, at: timestamps[step.status] } : step,
  );
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
const at = (d: Date, h: number, m: number) => {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

/**
 * Seed bookings are built at call time (on the client, after mount) so the
 * demo always shows dates relative to the day it is opened. Building them at
 * module load would freeze the dates at build time.
 */
export function createSeedBookings(): Booking[] {
  const yesterday = daysAgo(1);
  const dates = upcomingDates(7);

  return [
  {
    id: "bk-1001",
    reference: "FX-2026-0142",
    serviceSlug: "tap-faucet-repair",
    serviceName: "Tap & faucet repair",
    categoryId: "plumbing",
    addressId: "addr-1",
    date: dates[1],
    slot: "10:00",
    issueNotes:
      "Kitchen tap drips continuously even when fully closed. The mixer also feels loose.",
    attachments: ["demo-photo-1.png"],
    estimate: buildEstimate(499),
    paymentPreference: "pay-after-service",
    status: "assigned",
    timeline: timelineUpTo("assigned", {
      requested: at(yesterday, 18, 24),
      assigned: at(daysAgo(0), 9, 12),
    }),
    createdAt: at(yesterday, 18, 24),
  },
  {
    id: "bk-1002",
    reference: "FX-2026-0139",
    serviceSlug: "ac-service-deep-clean",
    serviceName: "AC service & deep clean",
    categoryId: "ac-repair",
    addressId: "addr-2",
    date: dates[3],
    slot: "14:00",
    issueNotes: "Bedroom AC hasn't been serviced in a year; cooling has dropped.",
    attachments: [],
    estimate: buildEstimate(899),
    paymentPreference: "demo-upi",
    status: "requested",
    timeline: timelineUpTo("requested", {
      requested: at(daysAgo(0), 11, 5),
    }),
    createdAt: at(daysAgo(0), 11, 5),
  },
  {
    id: "bk-1003",
    reference: "FX-2026-0121",
    serviceSlug: "washing-machine-repair",
    serviceName: "Washing machine repair",
    categoryId: "appliance-repair",
    addressId: "addr-1",
    date: iso(daysAgo(9)),
    slot: "16:00",
    issueNotes: "Machine leaves water at the end of the cycle and won't spin.",
    attachments: ["demo-photo-1.png", "demo-photo-2.png"],
    estimate: buildEstimate(749),
    paymentPreference: "pay-after-service",
    status: "completed",
    timeline: timelineUpTo("completed", {
      requested: at(daysAgo(11), 10, 2),
      assigned: at(daysAgo(11), 10, 40),
      on_the_way: at(daysAgo(9), 15, 30),
      in_progress: at(daysAgo(9), 16, 5),
      completed: at(daysAgo(9), 17, 10),
    }),
    createdAt: at(daysAgo(11), 10, 2),
  },
  {
    id: "bk-1004",
    reference: "FX-2026-0114",
    serviceSlug: "switch-socket-repair",
    serviceName: "Switch & socket repair",
    categoryId: "electrical",
    addressId: "addr-1",
    date: iso(daysAgo(16)),
    slot: "08:00",
    issueNotes: "Study room socket stopped working after a power cut.",
    attachments: [],
    estimate: buildEstimate(399),
    paymentPreference: "pay-after-service",
    status: "cancelled",
    timeline: timelineUpTo("cancelled", {
      requested: at(daysAgo(17), 20, 15),
      cancelled: at(daysAgo(16), 7, 40),
    }),
    createdAt: at(daysAgo(17), 20, 15),
  },
  ];
}

/* -------------------------------- Notifications ------------------------------- */

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

/** Built at call time so relative timestamps stay believable. */
export function createSeedNotifications(): AppNotification[] {
  return [
  {
    id: "ntf-1",
    kind: "booking",
    title: "Technician assigned to FX-2026-0142",
    body: "Ravi K. is assigned to your Tap & faucet repair visit tomorrow, 10 AM – 12 PM.",
    createdAt: hoursAgo(5),
    read: false,
    href: "/bookings/bk-1001",
  },
  {
    id: "ntf-2",
    kind: "estimate",
    title: "Approval needed for extra work",
    body: "A demo quote for a replacement valve (₹450) is waiting for your approval on FX-2026-0142.",
    createdAt: hoursAgo(3),
    read: false,
    href: "/bookings/bk-1001",
  },
  {
    id: "ntf-3",
    kind: "system",
    title: "This demo runs on simulated data",
    body: "Bookings, technicians, estimates and payments in this environment are fictional. Nothing here is processed for real.",
    createdAt: hoursAgo(30),
    read: true,
  },
  {
    id: "ntf-4",
    kind: "booking",
    title: "FX-2026-0121 completed",
    body: "Your washing machine repair was marked complete. The 30-day service warranty is now active.",
    createdAt: hoursAgo(216),
    read: true,
    href: "/bookings/bk-1003",
  },
  {
    id: "ntf-5",
    kind: "system",
    title: "Support case SUP-1039 resolved",
    body: "Your billing question was answered and the case was closed. You can reopen it from Support.",
    createdAt: hoursAgo(360),
    read: true,
  },
  ];
}

/* ---------------------------------- Lookups ---------------------------------- */

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getCategoryById(
  id: Service["categoryId"],
): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((c) => c.id === id);
}

export function getServicesByCategory(id: Service["categoryId"]): Service[] {
  return SERVICES.filter((s) => s.categoryId === id);
}

export function popularServices(): Service[] {
  return SERVICES.filter((s) => s.popular);
}

