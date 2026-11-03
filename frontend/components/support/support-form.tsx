"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Send } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Button, buttonStyles } from "@/components/ui/button";
import { SelectField, TextAreaField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

const TOPICS = [
  { id: "booking-issue", label: "Issue with a booking" },
  { id: "estimate-billing", label: "Estimate or charges" },
  { id: "technician-visit", label: "Technician visit or timing" },
  { id: "account", label: "Account or profile" },
  { id: "other", label: "Something else" },
];

type Errors = Record<string, string>;

export function SupportForm({ initialBooking }: { initialBooking?: string }) {
  const { bookings, hydrated } = useDemoStore();
  const [topic, setTopic] = useState("");
  const [bookingRef, setBookingRef] = useState(initialBooking ?? "");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [ticket, setTicket] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (!topic) next.topic = "Choose the topic that fits best.";
    if (message.trim().length < 20)
      next.message = "Add at least 20 characters so the team can help.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    // Simulated submit — no request leaves the browser.
    setTimeout(() => {
      setTicket(`SUP-${Math.floor(1040 + Math.random() * 900)}`);
      setStatus("sent");
    }, 700);
  }

  function reset() {
    setTopic("");
    setBookingRef("");
    setMessage("");
    setErrors({});
    setTicket("");
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-[#c7e8d5] bg-success-soft p-6">
        <span className="grid size-11 place-items-center rounded-full bg-success text-white">
          <CircleCheck aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-3 text-[20px] font-semibold text-[#0f5c34]">
          Support case created
        </h2>
        <p className="mt-1 text-[14.5px] leading-relaxed text-[#14532d]">
          Your case reference is <strong>{ticket}</strong>. This is a simulated
          case — no email, SMS or ticket was sent to a real support team.
        </p>
        <dl className="mt-4 grid gap-2 rounded-md border border-[#c7e8d5] bg-surface p-4 text-[13.5px] sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted">Topic</dt>
            <dd className="font-medium text-ink">
              {TOPICS.find((t) => t.id === topic)?.label ?? "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Booking reference</dt>
            <dd className="font-medium text-ink">{bookingRef || "Not linked"}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={reset}>Create another request</Button>
          <Link
            href="/bookings"
            className={buttonStyles({ variant: "secondary" })}
          >
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="rounded-lg border border-line bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="What do you need help with?"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setErrors((prev) => ({ ...prev, topic: "" }));
            }}
            error={errors.topic}
          >
            <option value="">Choose a topic</option>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Related booking"
            optional
            hint={
              hydrated && bookings.length === 0
                ? "No bookings yet — you can still raise a general case."
                : "Linking a booking attaches its reference to the case."
            }
            value={bookingRef}
            onChange={(e) => setBookingRef(e.target.value)}
          >
            <option value="">Not linked to a booking</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.reference}>
                {booking.reference} · {booking.serviceName}
              </option>
            ))}
          </SelectField>

          <div className="sm:col-span-2">
            <TextAreaField
              label="Describe the issue"
              rows={5}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors((prev) => ({ ...prev, message: "" }));
              }}
              error={errors.message}
              hint={`${message.trim().length}/20 characters minimum. Don't include card or ID numbers.`}
              placeholder="e.g. The technician marked the visit complete, but the tap still drips."
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[12.5px] text-ink-muted">
            Submitting creates a simulated case in this browser only.
          </p>
          <Button type="submit" disabled={status === "sending"}>
            <Send aria-hidden="true" className="size-4" />
            {status === "sending" ? "Creating case…" : "Create support case"}
          </Button>
        </div>
      </div>

      <Notice className="mt-4" tone="info" title="What happens next">
        In a live product this would create a case in the support queue and show up
        in the admin portal. This demo stops at the confirmation screen.
      </Notice>
    </form>
  );
}
