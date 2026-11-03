import type { Service, ServiceCategoryId } from "./types";

/**
 * Service-specific booking questions.
 *
 * The booking flow has a single "details" step; what it asks depends on the
 * service. Keep entries short — one or two questions, only the first marked
 * required — so the step stays quick on a phone.
 *
 * Add a service entry to change its questions. Services without an entry fall
 * back to their category, then to the generic notes-only step.
 */

export interface BookingField {
  id: string;
  label: string;
  type: "select" | "text";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

export interface BookingIntake {
  /** Progress-bar label, e.g. "AC details" */
  stepLabel: string;
  title: string;
  description: string;
  fields: BookingField[];
}

const AC_TYPE: BookingField = {
  id: "ac-type",
  label: "AC type",
  type: "select",
  options: ["Split", "Window", "Both"],
  required: true,
};

const BY_SERVICE: Record<string, BookingIntake> = {
  "tap-faucet-repair": {
    stepLabel: "Tap details",
    title: "Tell us about the tap",
    description: "These two details decide which parts the technician brings.",
    fields: [
      {
        id: "fixture",
        label: "Which fixture?",
        type: "select",
        options: ["Kitchen tap", "Bathroom tap", "Mixer", "Other"],
        required: true,
      },
      {
        id: "symptom",
        label: "What is it doing?",
        type: "select",
        options: [
          "Drips when closed",
          "Runs constantly",
          "Handle feels loose",
          "No water",
        ],
        required: true,
      },
    ],
  },
  "sink-drain-unclogging": {
    stepLabel: "Drain details",
    title: "Where is it blocked?",
    description: "We'll bring the right clearing tools for the drain.",
    fields: [
      {
        id: "blockage",
        label: "Blocked drain",
        type: "select",
        options: ["Kitchen sink", "Wash basin", "Floor drain", "More than one"],
        required: true,
      },
      {
        id: "severity",
        label: "How bad is it?",
        type: "select",
        options: ["Draining slowly", "Completely blocked", "Water backs up"],
      },
    ],
  },
  "leakage-inspection-fix": {
    stepLabel: "Leak details",
    title: "Where is the leak?",
    description: "The area helps us judge whether tiles or walls may be involved.",
    fields: [
      {
        id: "area",
        label: "Leak location",
        type: "select",
        options: ["Bathroom", "Kitchen", "Balcony", "Ceiling"],
        required: true,
      },
      {
        id: "supply",
        label: "Is the water supply shut off?",
        type: "select",
        options: ["Yes", "No", "Not sure"],
      },
    ],
  },
  "switch-socket-repair": {
    stepLabel: "Electrical details",
    title: "What needs attention?",
    description: "Safety first — tell us if anything sparked or smells hot.",
    fields: [
      {
        id: "point",
        label: "Faulty point",
        type: "select",
        options: ["Switch", "Socket", "Plug point", "Several points"],
        required: true,
      },
      {
        id: "danger",
        label: "Any sparking or smell?",
        type: "select",
        options: ["No", "Sparking", "Burning smell"],
        hint: "If it is sparking, switch off that circuit before the visit.",
      },
    ],
  },
  "fan-repair-installation": {
    stepLabel: "Fan details",
    title: "Which fan is it?",
    description: "Installation and repair need different fittings.",
    fields: [
      {
        id: "fan-type",
        label: "Fan type",
        type: "select",
        options: ["Ceiling", "Exhaust", "Table or wall"],
        required: true,
      },
      {
        id: "fan-issue",
        label: "What's happening?",
        type: "select",
        options: [
          "Wobbles or noisy",
          "Won't start",
          "New installation",
          "Regulator issue",
        ],
        required: true,
      },
    ],
  },
  "inverter-mcb-issues": {
    stepLabel: "Power details",
    title: "What's tripping?",
    description: "A quick note on the pattern helps narrow down the cause.",
    fields: [
      {
        id: "unit",
        label: "Affected unit",
        type: "select",
        options: ["MCB", "Inverter", "Both"],
        required: true,
      },
      {
        id: "pattern",
        label: "When does it happen?",
        type: "select",
        options: ["Keeps tripping", "After a power cut", "Charging fault"],
      },
    ],
  },
  "ac-service-deep-clean": {
    stepLabel: "AC details",
    title: "Tell us about the AC",
    description: "Unit count decides how long the visit is booked for.",
    fields: [
      AC_TYPE,
      {
        id: "ac-units",
        label: "How many units?",
        type: "select",
        options: ["1", "2", "3", "4 or more"],
      },
    ],
  },
  "ac-not-cooling-diagnosis": {
    stepLabel: "AC details",
    title: "What is the AC doing?",
    description: "Symptoms decide what the technician tests first.",
    fields: [
      AC_TYPE,
      {
        id: "ac-issue",
        label: "Symptom",
        type: "select",
        options: [
          "Runs but doesn't cool",
          "Doesn't start",
          "Water leaking",
          "Noisy",
        ],
        required: true,
      },
    ],
  },
  "fridge-repair": {
    stepLabel: "Fridge details",
    title: "Tell us about the fridge",
    description: "Make and door type help with part availability.",
    fields: [
      {
        id: "fridge-type",
        label: "Fridge type",
        type: "select",
        options: ["Single door", "Double door", "Side-by-side"],
        required: true,
      },
      {
        id: "fridge-issue",
        label: "What's the issue?",
        type: "select",
        options: ["Not cooling", "Leaking", "Noisy", "Door not sealing"],
        required: true,
      },
    ],
  },
  "washing-machine-repair": {
    stepLabel: "Machine details",
    title: "Tell us about the machine",
    description: "Load type narrows down the likely fault.",
    fields: [
      {
        id: "machine-type",
        label: "Machine type",
        type: "select",
        options: ["Front load", "Top load", "Semi-automatic"],
        required: true,
      },
      {
        id: "machine-issue",
        label: "What's the issue?",
        type: "select",
        options: ["Won't drain", "Won't spin", "Leaks", "Won't start"],
        required: true,
      },
    ],
  },
  "chimney-microwave-service": {
    stepLabel: "Appliance details",
    title: "What should we service?",
    description: "Chimneys and microwaves need different kits.",
    fields: [
      {
        id: "appliance",
        label: "Appliance",
        type: "select",
        options: ["Chimney", "Microwave", "Both"],
        required: true,
      },
      {
        id: "service",
        label: "Service needed",
        type: "select",
        options: ["Deep clean", "Not working properly", "Noisy"],
      },
    ],
  },
  "door-lock-repair": {
    stepLabel: "Door details",
    title: "What's wrong with the door?",
    description: "We'll bring the right hinge and lock fittings.",
    fields: [
      {
        id: "door-issue",
        label: "The problem",
        type: "select",
        options: ["Door sticks", "Hinge loose", "Lock jammed", "Handle loose"],
        required: true,
      },
    ],
  },
  "furniture-assembly-fixing": {
    stepLabel: "Furniture details",
    title: "What are we assembling?",
    description: "Unit count decides how many technicians to book.",
    fields: [
      {
        id: "furniture",
        label: "Furniture type",
        type: "select",
        options: ["Wardrobe", "Shelf or rack", "Bed", "Table or chair"],
        required: true,
      },
      {
        id: "units",
        label: "How many units?",
        type: "select",
        options: ["1", "2", "3 or more"],
      },
    ],
  },
  "phone-charging-port-repair": {
    stepLabel: "Device details",
    title: "Which device is it?",
    description: "Port parts differ by device, so we reserve one before the visit.",
    fields: [
      {
        id: "platform",
        label: "Device",
        type: "select",
        options: ["Android", "iPhone", "Other"],
        required: true,
      },
      {
        id: "model",
        label: "Model",
        type: "text",
        placeholder: "e.g. Pixel 8, iPhone 13",
        hint: "Optional, but it helps confirm the part.",
      },
    ],
  },
};

/** Applied to services added later without their own entry. */
const BY_CATEGORY: Record<ServiceCategoryId, BookingIntake> = {
  plumbing: {
    stepLabel: "Plumbing details",
    title: "Tell us about the problem",
    description: "A little detail helps the technician arrive prepared.",
    fields: [
      {
        id: "area",
        label: "Where is it?",
        type: "select",
        options: ["Kitchen", "Bathroom", "Balcony", "Other"],
        required: true,
      },
    ],
  },
  electrical: {
    stepLabel: "Electrical details",
    title: "Tell us about the problem",
    description: "A little detail helps the technician arrive prepared.",
    fields: [
      {
        id: "point",
        label: "Faulty point",
        type: "select",
        options: ["Switch", "Socket", "Plug point", "Several points"],
        required: true,
      },
    ],
  },
  "ac-repair": {
    stepLabel: "AC details",
    title: "Tell us about the AC",
    description: "Type and symptoms decide what the technician tests first.",
    fields: [AC_TYPE],
  },
  "appliance-repair": {
    stepLabel: "Appliance details",
    title: "Tell us about the appliance",
    description: "A little detail helps the technician arrive prepared.",
    fields: [
      {
        id: "appliance",
        label: "Appliance",
        type: "select",
        options: ["Refrigerator", "Washing machine", "Chimney", "Microwave"],
        required: true,
      },
    ],
  },
  carpentry: {
    stepLabel: "Carpentry details",
    title: "Tell us about the job",
    description: "A little detail helps the technician arrive prepared.",
    fields: [
      {
        id: "job",
        label: "Job type",
        type: "select",
        options: ["Door or lock", "Furniture", "Shelves or racks", "Other"],
        required: true,
      },
    ],
  },
  "mobile-repair": {
    stepLabel: "Device details",
    title: "Which device is it?",
    description: "Port parts differ by device, so we reserve one before the visit.",
    fields: [
      {
        id: "platform",
        label: "Device",
        type: "select",
        options: ["Android", "iPhone", "Other"],
        required: true,
      },
    ],
  },
};

const FALLBACK: BookingIntake = {
  stepLabel: "Details",
  title: "Anything the technician should know?",
  description: "Add a note or a photo so the visit starts prepared.",
  fields: [],
};

export function getBookingIntake(service: Service): BookingIntake {
  return BY_SERVICE[service.slug] ?? BY_CATEGORY[service.categoryId] ?? FALLBACK;
}

/** Answered fields, in the order the step asked them. */
export function intakeAnswers(
  intake: BookingIntake,
  answers: Record<string, string>,
): { label: string; value: string }[] {
  return intake.fields
    .map((field) => ({ label: field.label, value: (answers[field.id] ?? "").trim() }))
    .filter((entry) => entry.value.length > 0);
}

/** Compact one-line summary for the review row. */
export function intakeSummary(
  intake: BookingIntake,
  answers: Record<string, string>,
): string {
  return intakeAnswers(intake, answers)
    .map((entry) => entry.value)
    .join(" · ");
}

/** Structured lines folded into the booking's notes for the technician. */
export function intakeNotes(
  intake: BookingIntake,
  answers: Record<string, string>,
): string {
  return intakeAnswers(intake, answers)
    .map((entry) => `${entry.label}: ${entry.value}`)
    .join("\n");
}
