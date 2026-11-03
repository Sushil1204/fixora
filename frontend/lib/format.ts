/** Formatting helpers — Indian English conventions, INR currency. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** ₹499 / ₹1,299.50 */
export function formatINR(amount: number): string {
  return inr.format(amount);
}

/** 45 -> "45 min", 120 -> "2 hr" */
export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** "2026-11-08" -> "Sun, 8 Nov 2026" */
export function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** ISO timestamp -> "8 Nov, 10:12 AM" */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${time}`;
}

/** Slot id "10:00" -> "10 AM – 12 PM" */
export function formatSlot(slot: string): string {
  const [h] = slot.split(":").map(Number);
  const start = formatHour(h);
  const end = formatHour(h + 2);
  return `${start} – ${end}`;
}

function formatHour(h: number): string {
  const normalized = h % 24;
  const suffix = normalized < 12 ? "AM" : "PM";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${hour12} ${suffix}`;
}

/** Next `count` dates starting today, as YYYY-MM-DD */
export function upcomingDates(count: number): string[] {
  const dates: string[] = [];
  const start = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`,
    );
  }
  return dates;
}

/** "2026-11-08" -> "Today" | "Tomorrow" | "Sun, 8 Nov" */
export function friendlyDate(isoDate: string): string {
  const dates = upcomingDates(2);
  if (isoDate === dates[0]) return "Today";
  if (isoDate === dates[1]) return "Tomorrow";
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
