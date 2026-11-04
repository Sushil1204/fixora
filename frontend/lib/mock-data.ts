/**
 * Fixora mock-data layer — fictional demo content only.
 * No real people, addresses, or phone numbers. No network calls.
 */
import { upcomingDates } from "./format";
import { TECHNICIAN } from "./technician";
import { buildEstimate } from "./pricing";
import { buildTimeline } from "./job-workflow";
import type {
  Address,
  AppNotification,
  Booking,
  CatalogEntry,
  DisputeCase,
  JobWorkMap,
  Service,
  ServiceCategory,
  TechnicianDocument,
  TechnicianRecord,
  TimeSlot,
  UserProfile,
  VerificationStatus,
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
 *
 * These same bookings are the technician's assigned work — see
 * lib/demo-store.ts for the workflow actions that move them forward.
 */
export function createSeedBookings(): Booking[] {
  const yesterday = daysAgo(1);
  const today = daysAgo(0);
  const dates = upcomingDates(7);

  return [
    {
      id: "bk-1001",
      reference: "FX-2026-0142",
      technicianId: "tech-1",
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
      timeline: buildTimeline("assigned", {
        requested: at(yesterday, 18, 24),
        assigned: at(today, 9, 12),
      }),
      createdAt: at(yesterday, 18, 24),
    },
    {
      id: "bk-1005",
      reference: "FX-2026-0145",
      technicianId: "tech-1",
      serviceSlug: "leakage-inspection-fix",
      serviceName: "Leakage inspection & fix",
      categoryId: "plumbing",
      addressId: "addr-1",
      date: dates[0],
      slot: "10:00",
      issueNotes:
        "Water pooling under the kitchen sink since last night. The shut-off valve feels stuck.",
      attachments: ["demo-photo-1.png"],
      estimate: buildEstimate(599),
      paymentPreference: "demo-upi",
      status: "awaiting_approval",
      timeline: buildTimeline("awaiting_approval", {
        requested: at(yesterday, 19, 5),
        assigned: at(today, 8, 35),
        accepted: at(today, 8, 38),
        on_the_way: at(today, 9, 20),
        arrived: at(today, 9, 58),
        in_progress: at(today, 10, 5),
        awaiting_approval: at(today, 10, 40),
      }),
      createdAt: at(yesterday, 19, 5),
    },
    {
      id: "bk-1006",
      reference: "FX-2026-0146",
      technicianId: "tech-1",
      serviceSlug: "switch-socket-repair",
      serviceName: "Switch & socket repair",
      categoryId: "electrical",
      addressId: "addr-2",
      date: dates[0],
      slot: "16:00",
      issueNotes:
        "Two living-room sockets stopped working after a voltage fluctuation. No burning smell.",
      attachments: [],
      estimate: buildEstimate(399),
      paymentPreference: "pay-after-service",
      status: "assigned",
      timeline: buildTimeline("assigned", {
        requested: at(yesterday, 21, 10),
        assigned: at(today, 9, 5),
      }),
      createdAt: at(yesterday, 21, 10),
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
      issueNotes:
        "Bedroom AC hasn't been serviced in a year; cooling has dropped.",
      attachments: [],
      estimate: buildEstimate(899),
      paymentPreference: "demo-upi",
      status: "requested",
      timeline: buildTimeline("requested", {
        requested: at(today, 11, 5),
      }),
      createdAt: at(today, 11, 5),
    },
    {
      id: "bk-1007",
      reference: "FX-2026-0131",
      technicianId: "tech-1",
      serviceSlug: "chimney-microwave-service",
      serviceName: "Chimney & microwave service",
      categoryId: "appliance-repair",
      addressId: "addr-1",
      date: iso(daysAgo(3)),
      slot: "08:00",
      issueNotes:
        "Chimney suction is weak and the filters are greasy. Microwave turntable squeaks.",
      attachments: [],
      estimate: buildEstimate(649),
      paymentPreference: "pay-after-service",
      status: "completed",
      timeline: buildTimeline("completed", {
        requested: at(daysAgo(5), 12, 0),
        assigned: at(daysAgo(5), 12, 20),
        accepted: at(daysAgo(5), 12, 31),
        on_the_way: at(daysAgo(3), 9, 5),
        arrived: at(daysAgo(3), 9, 32),
        in_progress: at(daysAgo(3), 9, 40),
        completed: at(daysAgo(3), 10, 25),
      }),
      createdAt: at(daysAgo(5), 12, 0),
    },
    {
      id: "bk-1003",
      reference: "FX-2026-0121",
      technicianId: "tech-1",
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
      timeline: buildTimeline("completed", {
        requested: at(daysAgo(11), 10, 2),
        assigned: at(daysAgo(11), 10, 40),
        accepted: at(daysAgo(11), 10, 52),
        on_the_way: at(daysAgo(9), 15, 30),
        arrived: at(daysAgo(9), 15, 58),
        in_progress: at(daysAgo(9), 16, 5),
        completed: at(daysAgo(9), 17, 10),
      }),
      createdAt: at(daysAgo(11), 10, 2),
    },
    {
      id: "bk-1008",
      reference: "FX-2026-0118",
      technicianId: "tech-1",
      serviceSlug: "ac-service-deep-clean",
      serviceName: "AC service & deep clean",
      categoryId: "ac-repair",
      addressId: "addr-2",
      date: iso(daysAgo(26)),
      slot: "12:00",
      issueNotes: "Annual service before summer. Cooling has been fine.",
      attachments: [],
      estimate: buildEstimate(899),
      paymentPreference: "demo-card",
      status: "completed",
      timeline: buildTimeline("completed", {
        requested: at(daysAgo(28), 16, 20),
        assigned: at(daysAgo(28), 16, 35),
        accepted: at(daysAgo(28), 16, 40),
        on_the_way: at(daysAgo(26), 11, 0),
        arrived: at(daysAgo(26), 11, 24),
        in_progress: at(daysAgo(26), 11, 30),
        completed: at(daysAgo(26), 12, 20),
      }),
      createdAt: at(daysAgo(28), 16, 20),
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
      timeline: buildTimeline("cancelled", {
        requested: at(daysAgo(17), 20, 15),
        cancelled: at(daysAgo(16), 7, 40),
      }),
      createdAt: at(daysAgo(17), 20, 15),
    },
  ];
}

/**
 * Technician-side seed state. bk-1005 carries a pending extra-work quote so
 * the customer approval loop can be demonstrated end to end; the completed
 * jobs feed the earnings screen.
 */
export function createSeedJobWork(): JobWorkMap {
  const today = daysAgo(0);
  const allDone = [
    "pre-call",
    "pre-confirm",
    "pre-setup",
    "post-test",
    "post-clean",
    "post-handover",
  ];

  return {
    "bk-1005": {
      done: ["pre-call", "pre-confirm", "pre-setup"],
      evidence: { before: at(today, 10, 2) },
      quote: {
        items: [
          {
            id: "quote-1",
            description: "Replacement shut-off valve and washer set",
            amount: 450,
          },
          {
            id: "quote-2",
            description: "Extra 30 min labour for the seized joint",
            amount: 150,
          },
        ],
        note: "The shut-off valve under the sink is seized. It needs replacing before the leak can be closed.",
        status: "pending",
        submittedAt: at(today, 10, 40),
      },
      notes:
        "Leak traced to the valve joint. Waiting on customer approval before replacing the valve.",
    },
    "bk-1003": {
      done: allDone,
      evidence: {
        before: at(daysAgo(9), 16, 8),
        part: at(daysAgo(9), 16, 41),
        after: at(daysAgo(9), 17, 2),
      },
      quote: {
        items: [
          {
            id: "quote-1",
            description: "Drain hose clamp and seal",
            amount: 250,
          },
        ],
        note: "The drain hose clamp had cracked and was replaced with a standard part.",
        status: "approved",
        submittedAt: at(daysAgo(9), 16, 30),
        decidedAt: at(daysAgo(9), 16, 45),
      },
      notes:
        "Drain pump and belt were fine. Replaced the cracked hose clamp and ran a full spin cycle.",
    },
    "bk-1007": {
      done: allDone,
      evidence: {
        before: at(daysAgo(3), 9, 44),
        part: at(daysAgo(3), 9, 58),
        after: at(daysAgo(3), 10, 18),
      },
      notes:
        "Degreased the chimney filters and cleaned the microwave cavity. Suction is back to normal.",
    },
    "bk-1008": {
      done: allDone,
      evidence: {
        before: at(daysAgo(26), 11, 33),
        part: at(daysAgo(26), 11, 52),
        after: at(daysAgo(26), 12, 12),
      },
      notes:
        "Coils cleaned, drain tray flushed, cooling test passed. Customer declined gas top-up.",
    },
  };
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
    body: "Ravi K. raised a ₹600 quote for a replacement valve on FX-2026-0145. Approve or decline it from the booking.",
    createdAt: hoursAgo(3),
    read: false,
    href: "/bookings/bk-1005",
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

/* -------------------------------- Admin portal -------------------------------- */

const DOC_DEFINITIONS: {
  kind: TechnicianDocument["kind"];
  name: string;
}[] = [
  { kind: "identity", name: "Government ID" },
  { kind: "police", name: "Police verification" },
  { kind: "skill", name: "Skill certificate" },
  { kind: "address", name: "Address proof" },
];

/** Simulated document records — filenames are placeholders, never real files. */
function buildTechnicianDocuments(
  uploadedDaysAgo: number,
  overrides: Partial<Record<TechnicianDocument["kind"], VerificationStatus>> = {},
  rejectionNote?: { kind: TechnicianDocument["kind"]; note: string },
): TechnicianDocument[] {
  return DOC_DEFINITIONS.map((definition) => {
    const note =
      rejectionNote?.kind === definition.kind
        ? rejectionNote.note
        : "Demo document placeholder — no file is stored or uploaded.";
    return {
      id: `doc-${definition.kind}`,
      kind: definition.kind,
      name: definition.name,
      status: overrides[definition.kind] ?? "verified",
      uploadedAt: at(daysAgo(uploadedDaysAgo), 10, 15),
      note,
    };
  });
}

/**
 * The demo technician roster. Ravi is the signed-in technician used by `/technician`;
 * the rest exist so operations can review, approve and assign work.
 */
export function createSeedTechnicians(): TechnicianRecord[] {
  return [
    {
      id: "tech-1",
      code: TECHNICIAN.technicianCode,
      name: TECHNICIAN.name,
      initials: TECHNICIAN.initials,
      phone: TECHNICIAN.phone,
      email: "ravi.kumar@fixora.example",
      skills: [...TECHNICIAN.skills],
      coverage: [...TECHNICIAN.coverage],
      rating: TECHNICIAN.rating,
      jobsCompleted: TECHNICIAN.jobsCompleted,
      yearsExperience: TECHNICIAN.yearsExperience,
      joinedAt: iso(daysAgo(430)),
      lastActiveAt: hoursAgo(0.6),
      verification: "verified",
      documents: buildTechnicianDocuments(430),
    },
    {
      id: "tech-2",
      code: "TECH-1038",
      name: "Meera Iyer",
      initials: "MI",
      phone: "+91 90000 23456",
      email: "meera.iyer@fixora.example",
      skills: ["ac-repair", "appliance-repair"],
      coverage: ["Indiranagar", "HSR Layout", "Bellandur"],
      rating: "4.9",
      jobsCompleted: 448,
      yearsExperience: 8,
      joinedAt: iso(daysAgo(690)),
      lastActiveAt: hoursAgo(2.5),
      verification: "verified",
      documents: buildTechnicianDocuments(690),
    },
    {
      id: "tech-3",
      code: "TECH-1051",
      name: "Imran Qureshi",
      initials: "IQ",
      phone: "+91 90000 34567",
      email: "imran.qureshi@fixora.example",
      skills: ["electrical", "carpentry"],
      coverage: ["Koramangala", "Jayanagar", "BTM Layout"],
      rating: "4.7",
      jobsCompleted: 186,
      yearsExperience: 5,
      joinedAt: iso(daysAgo(310)),
      lastActiveAt: hoursAgo(5),
      verification: "verified",
      documents: buildTechnicianDocuments(310),
    },
    {
      id: "tech-4",
      code: "TECH-1063",
      name: "Kavya Menon",
      initials: "KM",
      phone: "+91 90000 45678",
      email: "kavya.menon@fixora.example",
      skills: ["mobile-repair", "appliance-repair"],
      coverage: ["Whitefield", "Marathahalli"],
      rating: "4.6",
      jobsCompleted: 64,
      yearsExperience: 3,
      joinedAt: iso(daysAgo(48)),
      lastActiveAt: hoursAgo(26),
      verification: "pending",
      documents: buildTechnicianDocuments(
        3,
        { identity: "pending", police: "pending" },
      ),
    },
    {
      id: "tech-5",
      code: "TECH-1067",
      name: "Arjun Das",
      initials: "AD",
      phone: "+91 90000 56789",
      email: "arjun.das@fixora.example",
      skills: ["plumbing", "carpentry"],
      coverage: ["Rajajinagar", "Malleshwaram"],
      rating: "4.5",
      jobsCompleted: 22,
      yearsExperience: 2,
      joinedAt: iso(daysAgo(11)),
      lastActiveAt: hoursAgo(51),
      verification: "pending",
      documents: buildTechnicianDocuments(
        2,
        { identity: "pending", police: "pending", skill: "pending" },
      ),
    },
    {
      id: "tech-6",
      code: "TECH-1029",
      name: "Neha Kulkarni",
      initials: "NK",
      phone: "+91 90000 67890",
      email: "neha.kulkarni@fixora.example",
      skills: ["ac-repair", "electrical"],
      coverage: ["HSR Layout", "Sarjapur Road"],
      rating: "4.8",
      jobsCompleted: 538,
      yearsExperience: 9,
      joinedAt: iso(daysAgo(820)),
      lastActiveAt: hoursAgo(140),
      verification: "rejected",
      verificationNote:
        "Name on the uploaded government ID does not match the demo profile. Re-upload required.",
      documents: buildTechnicianDocuments(
        21,
        { identity: "rejected" },
        {
          kind: "identity",
          note: "Rejected in the demo review: name mismatch on the placeholder ID.",
        },
      ),
    },
  ];
}

/** Support and dispute cases shown in the operations queue. */
export function createSeedDisputes(): DisputeCase[] {
  return [
    {
      id: "disp-1001",
      reference: "SUP-1046",
      bookingId: "bk-1007",
      kind: "quality",
      priority: "high",
      status: "investigating",
      owner: "Priya Nair",
      summary:
        "Chimney suction is still weak after the visit. The customer says the filters were not removed and wants a re-visit.",
      openedAt: hoursAgo(26),
      slaHours: 24,
      evidence: ["Service notes (demo)", "Before photo placeholder", "Customer message"],
      customerUpdates: [
        {
          id: "upd-1",
          body: "We've received your case and are reviewing the visit notes.",
          at: hoursAgo(26),
          author: "Fixora support",
        },
        {
          id: "upd-2",
          body: "We've asked the technician for details and will update you within one working day.",
          at: hoursAgo(20),
          author: "Priya Nair",
        },
      ],
      internalNotes: [
        {
          id: "note-1",
          body: "Technician notes say the filters were degreased, not replaced. Confirm whether replacement was ever quoted before offering a re-visit.",
          at: hoursAgo(18),
          author: "Dev Patel",
        },
      ],
    },
    {
      id: "disp-1002",
      reference: "SUP-1044",
      bookingId: "bk-1003",
      kind: "billing",
      priority: "medium",
      status: "open",
      owner: null,
      summary:
        "Customer says the ₹250 extra part was already included in the original estimate and is asking for a refund.",
      openedAt: hoursAgo(52),
      slaHours: 48,
      evidence: ["Estimate snapshot (demo)", "Extra-work quote", "Payment record placeholder"],
      customerUpdates: [
        {
          id: "upd-1",
          body: "We've received your billing question and are checking the estimate and quote records.",
          at: hoursAgo(52),
          author: "Fixora support",
        },
      ],
      internalNotes: [
        {
          id: "note-1",
          body: "Quote was approved separately for ₹250; not part of the base estimate. Needs a clear customer explanation, not a refund.",
          at: hoursAgo(40),
          author: "Anita Rao",
        },
      ],
    },
    {
      id: "disp-1003",
      reference: "SUP-1047",
      bookingId: "bk-1005",
      kind: "quality",
      priority: "high",
      status: "open",
      owner: "Dev Patel",
      summary:
        "Water is pooling again under the kitchen sink after the valve replacement. Customer reports a slow leak.",
      openedAt: hoursAgo(6),
      slaHours: 12,
      evidence: ["Technician notes (demo)", "After photo placeholder", "Customer message"],
      customerUpdates: [
        {
          id: "upd-1",
          body: "Thanks for flagging this. Operations is reviewing the visit before arranging a re-visit.",
          at: hoursAgo(6),
          author: "Fixora support",
        },
      ],
      internalNotes: [
        {
          id: "note-1",
          body: "Job is still awaiting customer approval on the ₹600 valve quote — do not close this case before the visit is completed.",
          at: hoursAgo(4),
          author: "Dev Patel",
        },
      ],
    },
    {
      id: "disp-1004",
      reference: "SUP-1048",
      bookingId: "bk-1002",
      kind: "billing",
      priority: "medium",
      status: "investigating",
      owner: "Anita Rao",
      summary:
        "A demo UPI payment appears twice in the customer's history and needs an operations check before the visit.",
      openedAt: hoursAgo(2),
      slaHours: 24,
      evidence: ["Payment record placeholder", "Customer screenshot placeholder"],
      customerUpdates: [
        {
          id: "upd-1",
          body: "We're checking the duplicate demo payment; no money moves in this environment.",
          at: hoursAgo(2),
          author: "Anita Rao",
        },
      ],
      internalNotes: [],
    },
    {
      id: "disp-1005",
      reference: "SUP-1038",
      bookingId: "bk-1008",
      kind: "delay",
      priority: "low",
      status: "resolved",
      owner: "Priya Nair",
      summary:
        "The technician arrived outside the booked window. Customer asked for the visit to be noted, not for a refund.",
      openedAt: hoursAgo(288),
      slaHours: 48,
      evidence: ["Timeline snapshot (demo)"],
      customerUpdates: [
        {
          id: "upd-1",
          body: "We've reviewed the arrival time against the booking window and shared feedback with dispatch.",
          at: hoursAgo(280),
          author: "Priya Nair",
        },
        {
          id: "upd-2",
          body: "Your case is resolved. A ₹150 demo goodwill credit was applied to the next booking.",
          at: hoursAgo(260),
          author: "Priya Nair",
        },
      ],
      internalNotes: [
        {
          id: "note-1",
          body: "Arrival was 24 minutes late; customer only wanted it recorded. Applied demo goodwill credit and closed.",
          at: hoursAgo(261),
          author: "Priya Nair",
        },
      ],
      resolution:
        "Arrival time reviewed with dispatch. ₹150 demo goodwill credit applied; customer confirmed the visit was otherwise fine.",
      resolvedAt: hoursAgo(260),
    },
    {
      id: "disp-1006",
      reference: "SUP-1035",
      bookingId: "bk-1004",
      kind: "delay",
      priority: "low",
      status: "resolved",
      owner: "Dev Patel",
      summary:
        "Customer was charged a cancellation fee after a technician reschedule and asked for the charge to be reviewed.",
      openedAt: hoursAgo(408),
      slaHours: 72,
      evidence: ["Cancellation record (demo)"],
      customerUpdates: [
        {
          id: "upd-1",
          body: "We've waived the demo cancellation fee because the reschedule came from our side.",
          at: hoursAgo(390),
          author: "Dev Patel",
        },
      ],
      internalNotes: [],
      resolution:
        "Reschedule originated from dispatch, so the ₹99 demo cancellation fee was waived.",
      resolvedAt: hoursAgo(390),
    },
  ];
}

/** Admin catalogue records seeded from the customer-facing service list. */
export function createSeedCatalog(): CatalogEntry[] {
  return SERVICES.map((service, index) => ({
    ...service,
    status: "live" as const,
    priceBasis:
      index % 2 === 0
        ? "Starting price · parts and extra work quoted after inspection"
        : "Inspection-based final quote · starting price shown",
    updatedAt: at(daysAgo(index % 9), 11, 30),
  }));
}

