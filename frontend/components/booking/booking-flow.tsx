"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  ClipboardList,
  CreditCard,
  ImagePlus,
  MapPin,
  Plus,
  Receipt,
  Wallet,
  X,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { TIME_SLOTS } from "@/lib/mock-data";
import { buildEstimate } from "@/lib/pricing";
import {
  formatDate,
  formatDuration,
  formatINR,
  formatSlot,
  friendlyDate,
} from "@/lib/format";
import { useUpcomingDates } from "@/lib/use-upcoming-dates";
import {
  getBookingIntake,
  intakeNotes,
  intakeSummary,
} from "@/lib/booking-intake";
import type { Address, PaymentPreference, Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { SelectField, TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { EstimateSummary } from "@/components/bookings/estimate-summary";
import { cn } from "@/lib/cn";

const PAYMENT_OPTIONS: {
  id: PaymentPreference;
  title: string;
  body: string;
  Icon: typeof Wallet;
}[] = [
  {
    id: "pay-after-service",
    title: "Pay after the service",
    body: "Settle by UPI or cash when the visit is done. Nothing is collected in this demo.",
    Icon: Banknote,
  },
  {
    id: "demo-upi",
    title: "Demo UPI confirmation",
    body: "Simulates a UPI step so you can see the flow. No money moves and no UPI ID is collected.",
    Icon: Wallet,
  },
  {
    id: "demo-card",
    title: "Demo card",
    body: "Shows where card entry would sit. This demo never asks for card details.",
    Icon: CreditCard,
  },
];

interface NewAddressDraft {
  label: Address["label"];
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  phone: string;
}

const emptyDraft: NewAddressDraft = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  pincode: "",
  phone: "",
};

type Errors = Record<string, string>;

export function BookingFlow({
  service,
  inSheet = false,
}: {
  service: Service;
  /** True while the wizard is inside the mobile bottom sheet */
  inSheet?: boolean;
}) {
  const router = useRouter();
  const { addresses, addAddress, createBooking, profile } = useDemoStore();

  // Details are service-specific: the questions and the step label come from
  // the service, while the flow itself stays four steps for every booking.
  const intake = getBookingIntake(service);
  const steps = [
    { id: "address", label: "Address" },
    { id: "schedule", label: "Schedule" },
    { id: "details", label: intake.stepLabel },
    { id: "confirm", label: "Confirm" },
  ];

  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [addingAddress, setAddingAddress] = useState(addresses.length === 0);
  const [draft, setDraft] = useState<NewAddressDraft>({
    ...emptyDraft,
    city: "Bengaluru",
    phone: profile.phone,
  });
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [payment, setPayment] = useState<PaymentPreference | "">("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Dates resolve on the client only (see useUpcomingDates) so the prerendered
  // HTML never contains a build-time date.
  const dates = useUpcomingDates(7);

  const estimate = useMemo(
    () => buildEstimate(service.startPrice),
    [service.startPrice],
  );
  const selectedAddress = addresses.find((a) => a.id === addressId);
  const detailSummary = intakeSummary(intake, answers);

  function goTo(next: number) {
    setStep(Math.max(0, Math.min(steps.length - 1, next)));
    setErrors({});
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function validateStep(index: number): Errors {
    const next: Errors = {};
    if (index === 0) {
      if (addingAddress) {
        if (!draft.line1.trim()) next.line1 = "Enter the flat, building or house number.";
        if (!draft.city.trim()) next.city = "Enter the city.";
        if (!/^\d{6}$/.test(draft.pincode.trim()))
          next.pincode = "Enter a 6-digit pincode.";
        const digits = draft.phone.replace(/\D/g, "");
        if (digits.length < 10)
          next.phone = "Enter a 10-digit phone number for the technician.";
      } else if (!addressId) {
        next.address = "Choose an address for the visit.";
      }
    }
    if (index === 1) {
      if (!date) next.date = "Choose a date.";
      if (!slot) next.slot = "Choose a time window.";
    }
    if (index === 2) {
      for (const field of intake.fields) {
        if (field.required && !(answers[field.id] ?? "").trim()) {
          next[field.id] =
            field.type === "select"
              ? "Choose one of the options."
              : "Add this detail to continue.";
        }
      }
      if (notes.length > 500) {
        next.notes = "Keep notes under 500 characters.";
      }
    }
    return next;
  }

  function handleContinue() {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    // Persist a newly entered address once, then treat it as a saved one.
    if (step === 0 && addingAddress) {
      const created = addAddress({
        label: draft.label,
        line1: draft.line1.trim(),
        line2: draft.line2.trim() || undefined,
        city: draft.city.trim(),
        pincode: draft.pincode.trim(),
        phone: draft.phone.trim(),
      });
      setAddressId(created.id);
      setAddingAddress(false);
      setDraft({ ...emptyDraft, city: "Bengaluru", phone: profile.phone });
    }
    goTo(step + 1);
  }

  function handleConfirm() {
    const detailErrors = validateStep(2);
    if (Object.keys(detailErrors).length > 0) {
      goTo(2);
      setErrors(detailErrors);
      return;
    }
    if (!payment) {
      setErrors({ payment: "Choose how you'd like to pay." });
      return;
    }
    if (!selectedAddress || !date || !slot) {
      setErrors({ payment: "Complete the earlier steps first." });
      return;
    }

    setSubmitting(true);
    const booking = createBooking({
      serviceSlug: service.slug,
      addressId: selectedAddress.id,
      date,
      slot,
      // Service-specific answers travel with the booking as structured notes.
      issueNotes: [intakeNotes(intake, answers), notes.trim()]
        .filter(Boolean)
        .join("\n\n"),
      attachments,
      paymentPreference: payment,
    });
    router.push(`/bookings/${booking.id}?created=1`);
  }

  // Cleared errors stay in state as empty strings, so count only messages.
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="rounded-lg border border-line bg-surface px-4 py-4 sm:px-6 sm:py-5">
        <Stepper steps={steps} current={step} />
      </div>

      {errorCount > 0 ? (
        <div className="mt-4">
          <Notice tone="warning" title="A few details need attention">
            Check the highlighted {errorCount === 1 ? "field" : "fields"} below.
          </Notice>
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-line bg-surface p-4 sm:p-6">
        {step === 0 ? (
          <section aria-labelledby="step-address">
            <h2 id="step-address" className="text-[19px] font-[650] text-ink">
              Where should we come?
            </h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              Choose a saved address or add a new one. The technician sees this
              address only after assignment.
            </p>

            {!addingAddress ? (
              <>
                <fieldset className="mt-4 min-w-0">
                  <legend className="sr-only">Saved addresses</legend>
                  <ul className="space-y-2.5">
                    {addresses.map((address) => {
                      const selected = address.id === addressId;
                      return (
                        <li key={address.id}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
                              selected
                                ? "border-brand bg-brand-subtle"
                                : "border-line bg-surface hover:border-line-strong",
                            )}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={address.id}
                              checked={selected}
                              onChange={() => setAddressId(address.id)}
                              className="mt-1 size-4 shrink-0 accent-[#1746a2]"
                            />
                            <span className="min-w-0">
                              <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                                {address.label}
                                <span className="rounded-sm bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                                  Saved
                                </span>
                              </span>
                              <span className="mt-1 block text-[14px] leading-relaxed text-ink-secondary">
                                {address.line1}
                                {address.line2 ? `, ${address.line2}` : ""},{" "}
                                {address.city} {address.pincode}
                              </span>
                              <span className="mt-0.5 block text-[13px] text-ink-muted">
                                Contact: {address.phone}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  {errors.address ? (
                    <p className="mt-2 text-[13px] font-medium text-danger">
                      {errors.address}
                    </p>
                  ) : null}
                </fieldset>

                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() => setAddingAddress(true)}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Add a new address
                </Button>
              </>
            ) : (
              <div className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <fieldset className="min-w-0">
                      <legend className="text-sm font-semibold text-ink">
                        Address label
                      </legend>
                      <div className="mt-1.5 flex gap-2">
                        {(["Home", "Work", "Other"] as const).map((label) => (
                          <label
                            key={label}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[14px] font-medium transition-colors",
                              draft.label === label
                                ? "border-brand bg-brand-subtle text-brand"
                                : "border-line text-ink-secondary hover:border-line-strong",
                            )}
                          >
                            <input
                              type="radio"
                              name="address-label"
                              value={label}
                              checked={draft.label === label}
                              onChange={() =>
                                setDraft((d) => ({ ...d, label }))
                              }
                              className="size-3.5 accent-[#1746a2]"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="sm:col-span-2">
                    <TextField
                      label="Flat, building or house number"
                      value={draft.line1}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, line1: e.target.value }))
                      }
                      error={errors.line1}
                      placeholder="e.g. 402, Shanti Heights"
                      autoComplete="address-line1"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <TextField
                      label="Area or street"
                      optional
                      value={draft.line2}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, line2: e.target.value }))
                      }
                      placeholder="e.g. 5th Block, Koramangala"
                      autoComplete="address-line2"
                    />
                  </div>

                  <TextField
                    label="City"
                    value={draft.city}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, city: e.target.value }))
                    }
                    error={errors.city}
                    autoComplete="address-level2"
                  />

                  <TextField
                    label="Pincode"
                    value={draft.pincode}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, pincode: e.target.value }))
                    }
                    error={errors.pincode}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="560095"
                    autoComplete="postal-code"
                  />

                  <div className="sm:col-span-2">
                    <TextField
                      label="Contact number"
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, phone: e.target.value }))
                      }
                      error={errors.phone}
                      hint="Used only by the assigned technician in this demo."
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="mt-2"
                  onClick={() => {
                    setAddingAddress(false);
                    setErrors({});
                  }}
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Use a saved address instead
                </Button>
              </div>
            )}
          </section>
        ) : null}

        {step === 1 ? (
          <section aria-labelledby="step-schedule">
            <h2 id="step-schedule" className="text-[19px] font-[650] text-ink">
              When suits you?
            </h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              Arrival windows are two hours. Times shown are demo availability and
              are not checked against a live schedule.
            </p>

            <fieldset className="mt-4 min-w-0">
              <legend className="text-sm font-semibold text-ink">Date</legend>
              <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0">
                {dates.length === 0
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[58px] w-16 shrink-0 animate-pulse rounded-md bg-[#e9edf3] sm:w-auto"
                      />
                    ))
                  : null}
                {dates.map((d) => {
                  const active = date === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setDate(d);
                        setErrors((e) => ({ ...e, date: "" }));
                      }}
                      className={cn(
                        "min-w-16 shrink-0 rounded-md border px-2 py-2.5 text-center transition-colors sm:min-w-0",
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-surface text-ink hover:border-line-strong",
                      )}
                    >
                      <span className="block text-[12px] opacity-80">
                        {friendlyDate(d)}
                      </span>
                      <span className="mt-0.5 block text-[14px] font-semibold">
                        {formatDate(d).split(",")[1]?.trim() ?? ""}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.date ? (
                <p className="mt-1.5 text-[13px] font-medium text-danger">
                  {errors.date}
                </p>
              ) : null}
            </fieldset>

            <fieldset className="mt-5 min-w-0">
              <legend className="text-sm font-semibold text-ink">
                Arrival window
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {TIME_SLOTS.map((s) => {
                  const active = slot === s.id;
                  const { start, end } = slotParts(s.label);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={end ? `${start} to ${end}` : s.label}
                      onClick={() => {
                        setSlot(s.id);
                        setErrors((e) => ({ ...e, slot: "" }));
                      }}
                      className={cn(
                        "relative flex h-12 items-center justify-center gap-1 rounded-md border px-2 text-[13px] tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        active
                          ? "border-brand bg-brand text-white shadow-sm"
                          : "border-line bg-surface hover:border-brand/40 hover:bg-brand-subtle",
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold",
                          active ? "text-white" : "text-ink",
                        )}
                      >
                        {start}
                      </span>
                      {end ? (
                        <>
                          <span
                            aria-hidden="true"
                            className={active ? "text-white/55" : "text-ink-muted"}
                          >
                            –
                          </span>
                          <span
                            className={
                              active ? "text-white/85" : "text-ink-secondary"
                            }
                          >
                            {end}
                          </span>
                        </>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {errors.slot ? (
                <p className="mt-1.5 text-[13px] font-medium text-danger">
                  {errors.slot}
                </p>
              ) : null}
            </fieldset>

            {date && slot ? (
              <Notice tone="info" className="mt-4">
                Visiting on <strong>{formatDate(date)}</strong>, between{" "}
                <strong>{formatSlot(slot)}</strong>.
              </Notice>
            ) : null}
          </section>
        ) : null}

        {step === 2 ? (
          <section aria-labelledby="step-details">
            <h2 id="step-details" className="text-[19px] font-[650] text-ink">
              {intake.title}
            </h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              {intake.description}
            </p>

            {intake.fields.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {intake.fields.map((field) =>
                  field.type === "select" ? (
                    <SelectField
                      key={field.id}
                      label={field.label}
                      optional={!field.required}
                      value={answers[field.id] ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAnswers((current) => ({
                          ...current,
                          [field.id]: value,
                        }));
                        setErrors((current) => ({
                          ...current,
                          [field.id]: "",
                        }));
                      }}
                      error={errors[field.id]}
                      hint={field.hint}
                    >
                      <option value="">Select an option</option>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  ) : (
                    <TextField
                      key={field.id}
                      label={field.label}
                      optional={!field.required}
                      value={answers[field.id] ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAnswers((current) => ({
                          ...current,
                          [field.id]: value,
                        }));
                        setErrors((current) => ({
                          ...current,
                          [field.id]: "",
                        }));
                      }}
                      error={errors[field.id]}
                      hint={field.hint}
                      placeholder={field.placeholder}
                    />
                  ),
                )}
              </div>
            ) : null}

            <div className="mt-5">
              <label
                htmlFor="issue-notes"
                className="text-sm font-semibold text-ink"
              >
                Anything else?
                <span className="ml-1 font-normal text-ink-muted">(optional)</span>
              </label>
              <textarea
                id="issue-notes"
                rows={4}
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                aria-invalid={errors.notes ? true : undefined}
                aria-describedby="issue-notes-hint"
                placeholder="e.g. The kitchen tap drips even when closed, and the handle feels loose."
                className="mt-1.5 w-full resize-y rounded-md border border-line bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted hover:border-line-strong focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand"
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                <p id="issue-notes-hint" className="text-[13px] text-ink-muted">
                  {errors.notes ? (
                    <span className="font-medium text-danger">{errors.notes}</span>
                  ) : (
                    "Avoid sharing sensitive personal information in the notes."
                  )}
                </p>
                <p aria-hidden="true" className="shrink-0 text-[12px] tabular-nums text-ink-muted">
                  {notes.length}/500
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">
                Photos<span className="ml-1 font-normal text-ink-muted">(optional)</span>
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Demo placeholder — no file is uploaded, read or stored.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {attachments.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-2 rounded-md border border-line bg-canvas px-2.5 py-1.5 text-[13px] text-ink-secondary"
                  >
                    <ImagePlus aria-hidden="true" className="size-4 text-ink-muted" />
                    {name}
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((list) => list.filter((a) => a !== name))
                      }
                      aria-label={`Remove ${name}`}
                      className="grid size-5 place-items-center rounded-full text-ink-muted hover:bg-line hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  </span>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setAttachments((list) => [
                      ...list,
                      `demo-photo-${list.length + 1}.png`,
                    ])
                  }
                  disabled={attachments.length >= 3}
                >
                  <ImagePlus aria-hidden="true" className="size-4" />
                  {attachments.length >= 3 ? "3 photos added" : "Add demo photo"}
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section aria-labelledby="step-confirm">
            <h2 id="step-confirm" className="text-[19px] font-[650] text-ink">
              Review and confirm
            </h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              Check the details and choose how to pay. You can edit any step
              before confirming.
            </p>

            <div className="mt-4 divide-y divide-line rounded-lg border border-line">
              <ReviewRow
                label="Address"
                onEdit={() => goTo(0)}
                value={
                  selectedAddress
                    ? `${selectedAddress.label} · ${selectedAddress.line1}${
                        selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""
                      }, ${selectedAddress.city} ${selectedAddress.pincode}`
                    : "Not set"
                }
                icon={MapPin}
              />
              <ReviewRow
                label="Date and time"
                onEdit={() => goTo(1)}
                value={
                  date && slot
                    ? `${formatDate(date)} · ${formatSlot(slot)}`
                    : "Not set"
                }
                icon={CalendarDays}
              />
              {intake.fields.length > 0 ? (
                <ReviewRow
                  label={intake.stepLabel}
                  onEdit={() => goTo(2)}
                  value={detailSummary || "No details added"}
                  icon={ClipboardList}
                />
              ) : null}
              <ReviewRow
                label="Notes for the technician"
                onEdit={() => goTo(2)}
                value={notes.trim() || "No notes added"}
                icon={Receipt}
              />
            </div>

            <div className="mt-4">
              <EstimateSummary estimate={estimate} showDisclaimer={false} />
              <p className="mt-2 text-[13px] text-ink-secondary">
                {formatDuration(service.durationMins)} estimated ·{" "}
                {selectedAddress ? selectedAddress.label : "Address"} ·{" "}
                {date ? formatDate(date) : "Date not set"}
                {slot ? `, ${formatSlot(slot)}` : ""}
              </p>
            </div>

            <fieldset className="mt-5 min-w-0">
              <legend className="text-sm font-semibold text-ink">
                How would you like to pay?
              </legend>
              <ul className="mt-2 space-y-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const active = payment === option.id;
                  return (
                    <li key={option.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors",
                          active
                            ? "border-brand bg-brand-subtle"
                            : "border-line bg-surface hover:border-line-strong",
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={option.id}
                          checked={active}
                          onChange={() => {
                            setPayment(option.id);
                            setErrors((e) => ({ ...e, payment: "" }));
                          }}
                          className="mt-0.5 size-4 shrink-0 accent-[#1746a2]"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-[14.5px] font-semibold text-ink">
                            <option.Icon
                              aria-hidden="true"
                              className="size-4 text-brand"
                            />
                            {option.title}
                          </span>
                          <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-secondary">
                            {option.body}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {errors.payment ? (
                <p className="mt-2 text-[13px] font-medium text-danger">
                  {errors.payment}
                </p>
              ) : null}
            </fieldset>

            <Notice tone="warning" className="mt-4" title="Estimate, not a final bill">
              Final charges depend on inspection and your approval. Extra work is
              quoted separately before anything is done.
            </Notice>
            <Notice tone="info" className="mt-3">
              Confirming creates a simulated booking and opens its detail page. No
              technician is dispatched and no payment is taken.
            </Notice>
          </section>
        ) : null}
      </div>

      {/* Step navigation — pinned to the sheet on mobile, above the bottom nav on the page */}
      <div
        className={
          inSheet
            ? "sticky bottom-0 z-20 mt-4 -mx-4 border-t border-line bg-surface/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mx-0 md:mt-5 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"
            : "sticky bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] z-20 mt-4 -mx-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:static md:mx-0 md:mt-5 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <p className="hidden text-right text-[13px] leading-tight text-ink-muted sm:block">
              Estimated total
              <span className="block text-[15px] font-semibold text-ink">
                {formatINR(estimate.total)}
              </span>
            </p>
            {step < steps.length - 1 ? (
              <Button onClick={handleContinue}>
                Continue
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Creating booking…" : "Confirm booking"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** "8 AM – 10 AM" → { start: "8 AM", end: "10 AM" } */
function slotParts(label: string) {
  const [start, end] = label.split("–").map((part) => part.trim());
  return { start: start || label, end: end ?? "" };
}

function ReviewRow({
  label,
  value,
  onEdit,
  icon: Icon,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  icon: typeof MapPin;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-ink-muted">{label}</p>
        <p className="mt-0.5 text-[14px] leading-relaxed text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-sm px-2 py-1 text-[13px] font-semibold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Edit<span className="sr-only"> {label}</span>
      </button>
    </div>
  );
}
