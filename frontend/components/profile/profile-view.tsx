"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CircleHelp,
  FileText,
  LogOut,
  MapPin,
  Pencil,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Errors = Record<string, string>;

export function ProfileView() {
  const {
    profile,
    addresses,
    unreadCount,
    hydrated,
    signedOut,
    updateProfile,
    signOut,
    signIn,
    resetDemo,
  } = useDemoStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"signout" | "reset" | null>(
    null,
  );

  function startEditing() {
    setForm(profile);
    setErrors({});
    setSaved(false);
    setEditing(true);
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) next.phone = "Enter a 10-digit phone number.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setEditing(false);
    setSaved(true);
  }

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-lg bg-[#e9edf3]" />
        <div className="h-40 animate-pulse rounded-lg bg-[#e9edf3]" />
      </div>
    );
  }

  if (signedOut) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6">
        <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
          <UserRound aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-3 text-[19px] font-semibold text-ink">
          You&apos;re signed out of the demo
        </h2>
        <p className="mt-1 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
          There is no real account system here — this button only toggles a demo
          flag. Your saved bookings and addresses stay in this browser.
        </p>
        <Button className="mt-4" onClick={signIn}>
          Sign back in
        </Button>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0 space-y-4">
        {/* Identity */}
        <section
          aria-labelledby="identity-heading"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-[17px] font-semibold text-white"
              >
                {initials || "FX"}
              </span>
              <div className="min-w-0">
                <h2
                  id="identity-heading"
                  className="truncate text-[18px] font-semibold text-ink"
                >
                  {profile.name}
                </h2>
                <p className="truncate text-[13.5px] text-ink-muted">
                  {profile.email}
                </p>
                <p className="text-[13.5px] text-ink-muted">{profile.phone}</p>
              </div>
            </div>
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={startEditing}>
                <Pencil aria-hidden="true" className="size-3.5" />
                Edit profile
              </Button>
            ) : null}
          </div>

          {saved && !editing ? (
            <div className="mt-4">
              <Notice tone="success" title="Profile updated">
                Your contact details were saved in this browser for the demo.
              </Notice>
            </div>
          ) : null}

          {editing ? (
            <form onSubmit={handleSave} className="mt-5 border-t border-line pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextField
                    label="Full name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    error={errors.name}
                    autoComplete="name"
                  />
                </div>
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  error={errors.email}
                  autoComplete="email"
                />
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  error={errors.phone}
                  hint="Shared with the assigned technician only."
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit">Save changes</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </section>

        {/* Addresses */}
        <section
          aria-labelledby="addresses-heading"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="addresses-heading"
              className="text-[16px] font-semibold text-ink"
            >
              Saved addresses
            </h2>
            <span className="text-[13px] text-ink-muted">
              {addresses.length} saved
            </span>
          </div>

          <ul className="mt-3 space-y-2.5">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="flex gap-3 rounded-md border border-line p-3.5"
              >
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    {address.label}
                    <Badge tone="neutral">Demo</Badge>
                  </p>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-secondary">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}{" "}
                    {address.pincode}
                  </p>
                  <p className="text-[12.5px] text-ink-muted">{address.phone}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
            New addresses are added during booking. Editing existing addresses
            isn&apos;t part of this demo phase.
          </p>
        </section>

        {/* Demo controls */}
        <section
          aria-labelledby="demo-heading"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <h2 id="demo-heading" className="text-[16px] font-semibold text-ink">
            Demo controls
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">
            These actions change only this browser&apos;s demo data. Nothing is
            sent anywhere.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setConfirmAction("reset")}>
              <RotateCcw aria-hidden="true" className="size-4" />
              Reset demo data
            </Button>
            <Button
              variant="secondary"
              className="border-danger/30 text-danger hover:border-danger/50 hover:bg-danger-soft"
              onClick={() => setConfirmAction("signout")}
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out (demo)
            </Button>
          </div>
        </section>
      </div>

      {/* Links */}
      <div className="space-y-4">
        <nav
          aria-label="Account links"
          className="rounded-lg border border-line bg-surface p-2"
        >
          <ul>
            <ProfileLink
              href="/notifications"
              icon={Bell}
              label="Notifications"
              detail={
                unreadCount > 0 ? `${unreadCount} unread` : "All caught up"
              }
            />
            <ProfileLink
              href="/support"
              icon={CircleHelp}
              label="Help & support"
              detail="Raise a simulated case"
            />
            <ProfileLink
              href="/bookings"
              icon={FileText}
              label="Your bookings"
              detail="Estimates and timeline"
            />
            <ProfileLink
              href="/legal"
              icon={FileText}
              label="Legal & policies"
              detail="Terms, privacy, cancellation"
            />
          </ul>
        </nav>

        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-[15px] font-semibold text-ink">Faster support</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">
            Link a support case to a booking so the conversation starts with the
            right reference.
          </p>
          <Link
            href="/support"
            className={buttonStyles({
              variant: "secondary",
              fullWidth: true,
              size: "sm",
            }) + " mt-3"}
          >
            Open support
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === "signout"}
        title="Sign out of the demo?"
        description="This only flips a demo flag. Saved bookings and addresses stay in this browser, and you can sign back in immediately."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          signOut();
          setConfirmAction(null);
        }}
      />

      <ConfirmDialog
        open={confirmAction === "reset"}
        title="Reset all demo data?"
        description="Bookings you created, profile edits and read notifications will be cleared and the original seed data restored. This can't be undone."
        confirmLabel="Reset demo data"
        cancelLabel="Keep my data"
        destructive
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          resetDemo();
          setConfirmAction(null);
          setSaved(false);
          setEditing(false);
          setForm(profile);
        }}
      />
    </div>
  );
}

function ProfileLink({
  href,
  icon: Icon,
  label,
  detail,
}: {
  href: string;
  icon: typeof Bell;
  label: string;
  detail: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-ink">{label}</span>
          <span className="block text-[12.5px] text-ink-muted">{detail}</span>
        </span>
        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
      </Link>
    </li>
  );
}
