"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Wrench,
  X,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { SERVICE_CATEGORIES } from "@/lib/mock-data";
import { formatDate, formatTimestamp } from "@/lib/format";
import {
  activeJobCount,
  documentKindLabel,
  technicianActivityLabel,
  verificationMeta,
} from "@/lib/admin";
import type { TechnicianDocument, TechnicianRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { AdminDrawer } from "./admin-drawer";
import {
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  AdminToast,
  DemoTag,
  adminField,
  adminSelect,
} from "./admin-ui";

type StatusFilter = "all" | "pending" | "verified" | "rejected";

const VERIFICATION_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All verification states" },
  { value: "pending", label: "Pending review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export function TechniciansView() {
  const { technicians, bookings, hydrated } = useDemoStore();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>(
    VERIFICATION_FILTERS.some((entry) => entry.value === initialStatus)
      ? (initialStatus as StatusFilter)
      : "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("tech"),
  );
  const [toast, setToast] = useState<string | null>(null);

  if (!hydrated) return <AdminPageSkeleton cards={3} />;

  const filtered = technicians.filter((technician) => {
    if (status !== "all" && technician.verification !== status) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    const skills = technician.skills
      .map(
        (id) =>
          SERVICE_CATEGORIES.find((category) => category.id === id)?.name ?? id,
      )
      .join(" ");
    return [
      technician.name,
      technician.code,
      technician.email,
      technician.phone,
      technician.coverage.join(" "),
      skills,
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const selected =
    technicians.find((technician) => technician.id === selectedId) ?? null;
  const pending = technicians.filter(
    (technician) => technician.verification === "pending",
  ).length;
  const hasFilters = Boolean(query) || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Technicians"
        description="Review simulated documents, verification state and current workload. Approving a technician unlocks dispatch assignment."
        aside={
          <div className="flex items-center gap-2">
            {pending > 0 ? (
              <Badge tone="warning" dot>
                {pending} awaiting review
              </Badge>
            ) : (
              <Badge tone="success" dot>
                All reviewed
              </Badge>
            )}
            <DemoTag />
          </div>
        }
      />

      <AdminSection
        id="directory"
        title="Technician directory"
        description={`${filtered.length} of ${technicians.length} demo technicians`}
        action={
          hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:text-brand-hover"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear filters
            </button>
          ) : null
        }
      >
        <div className="grid gap-2.5 border-b border-line bg-canvas/40 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_210px] sm:px-5">
          <label className="relative block">
            <span className="sr-only">Search technicians</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, code, skill, email or coverage area"
              className={`${adminField} pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Filter by verification</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              className={adminSelect}
            >
              {VERIFICATION_FILTERS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length > 0 ? (
          <>
            <ul className="divide-y divide-line lg:hidden">
              {filtered.map((technician) => {
                const verification = verificationMeta[technician.verification];
                const active = activeJobCount(bookings, technician.id);
                const activity = technicianActivityLabel(active);
                const skillNames = technician.skills.map(
                  (id) =>
                    SERVICE_CATEGORIES.find((category) => category.id === id)
                      ?.name ?? id,
                );
                return (
                  <li key={technician.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(technician.id)}
                      className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-brand-subtle/40"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand"
                        >
                          {technician.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[13px] font-semibold text-ink">
                              {technician.name}
                            </p>
                            <Badge tone={verification.tone} dot>
                              {verification.label}
                            </Badge>
                          </div>
                          <p className="text-[11.5px] text-ink-muted">
                            {technician.code} · {skillNames.join(", ")}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-secondary">
                            <Badge tone={activity.tone} dot>
                              {activity.label}
                            </Badge>
                            <span className="inline-flex items-center gap-1">
                              <Star
                                aria-hidden="true"
                                className="size-3.5 fill-accent text-accent"
                              />
                              {technician.rating} · {technician.jobsCompleted} jobs
                            </span>
                            <span>{technician.coverage.slice(0, 2).join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                  <th scope="col" className="px-4 py-2.5 font-semibold sm:px-5">
                    Technician
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Verification
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Skills
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Coverage
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Activity
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Rating
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Last active
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold sm:px-5">
                    <span className="sr-only">Review technician</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((technician) => {
                  const verification = verificationMeta[technician.verification];
                  const active = activeJobCount(bookings, technician.id);
                  const activity = technicianActivityLabel(active);
                  const skillNames = technician.skills.map(
                    (id) =>
                      SERVICE_CATEGORIES.find((category) => category.id === id)
                        ?.name ?? id,
                  );
                  return (
                    <tr
                      key={technician.id}
                      className="hover:bg-brand-subtle/40"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand"
                          >
                            {technician.initials}
                          </span>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedId(technician.id)}
                              className="block text-left text-[12.5px] font-semibold text-ink hover:text-brand"
                            >
                              {technician.name}
                            </button>
                            <p className="text-[11px] text-ink-muted">
                              {technician.code} · {technician.yearsExperience} yrs
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={verification.tone} dot>
                          {verification.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-secondary">
                        {skillNames.join(", ")}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-secondary">
                        {technician.coverage.slice(0, 2).join(", ")}
                        {technician.coverage.length > 2 ? (
                          <span className="block text-[11px] text-ink-muted">
                            +{technician.coverage.length - 2} areas
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={activity.tone} dot>
                          {activity.label}
                        </Badge>
                        <p className="mt-1 text-[11px] text-ink-muted">
                          {active} active {active === 1 ? "job" : "jobs"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-secondary">
                        <span className="inline-flex items-center gap-1">
                          <Star
                            aria-hidden="true"
                            className="size-3.5 fill-accent text-accent"
                          />
                          {technician.rating}
                        </span>
                        <span className="block text-[11px] text-ink-muted">
                          {technician.jobsCompleted} jobs
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[11.5px] text-ink-muted">
                        {formatTimestamp(technician.lastActiveAt)}
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(technician.id)}
                          className="text-[12px] font-semibold text-brand hover:text-brand-hover"
                        >
                          Review
                          <span className="sr-only"> {technician.name}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Search}
              title="No technicians match"
              description="Try a different name, skill or verification state."
              action={
                hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
              compact
            />
          </div>
        )}
      </AdminSection>

      <p className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-muted">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        Verification records, documents and approval outcomes are fictional demo
        data. No identity checks or file storage take place.
      </p>

      {selected ? (
        <TechnicianDrawer
          key={selected.id}
          technician={selected}
          bookings={bookings}
          onClose={() => setSelectedId(null)}
          notify={setToast}
        />
      ) : null}

      <AdminToast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function TechnicianDrawer({
  technician,
  bookings,
  onClose,
  notify,
}: {
  technician: TechnicianRecord;
  bookings: ReturnType<typeof useDemoStore>["bookings"];
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const { decideTechnician } = useDemoStore();
  const [note, setNote] = useState(technician.verificationNote ?? "");
  const [confirm, setConfirm] = useState<"verified" | "rejected" | null>(null);

  const verification = verificationMeta[technician.verification];
  const active = activeJobCount(bookings, technician.id);
  const jobs = bookings.filter(
    (booking) => booking.technicianId === technician.id,
  );
  const skillNames = technician.skills.map(
    (id) => SERVICE_CATEGORIES.find((category) => category.id === id)?.name ?? id,
  );
  const canApprove = technician.verification !== "verified";
  const canReject = technician.verification !== "rejected";

  return (
    <AdminDrawer
      open
      onClose={onClose}
      title={technician.name}
      subtitle={`${technician.code} · joined ${formatDate(technician.joinedAt)} · demo technician`}
      width="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11.5px] text-ink-muted">
            Decisions apply to this browser session only.
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-brand text-[15px] font-semibold text-white"
          >
            {technician.initials}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={verification.tone} dot>
                {verification.label}
              </Badge>
              <Badge tone="neutral">Simulated documents</Badge>
            </div>
            <p className="mt-1 text-[12px] text-ink-muted">
              {technician.rating} ★ demo rating · {technician.jobsCompleted} jobs
            </p>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <InfoRow icon={Phone} label="Phone" value={technician.phone} />
          <InfoRow icon={Mail} label="Email" value={technician.email} />
          <InfoRow
            icon={BadgeCheck}
            label="Experience"
            value={`${technician.yearsExperience} years · joined ${formatDate(
              technician.joinedAt,
            )}`}
          />
          <InfoRow
            icon={CalendarDays}
            label="Last active"
            value={formatTimestamp(technician.lastActiveAt)}
          />
          <InfoRow
            icon={Wrench}
            label="Active workload"
            value={`${active} active ${active === 1 ? "job" : "jobs"}`}
          />
          <InfoRow
            icon={MapPin}
            label="Coverage"
            value={technician.coverage.join(", ")}
          />
        </div>

        <div>
          <h3 className="text-[13px] font-semibold text-ink">Skills</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {skillNames.map((skill) => (
              <Badge key={skill} tone="brand">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <section aria-labelledby="documents-heading">
          <h3
            id="documents-heading"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"
          >
            <FileText aria-hidden="true" className="size-4 text-ink-muted" />
            Documents
          </h3>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Safe placeholders only. Files cannot be opened because no document
            is stored.
          </p>
          <ul className="mt-2 space-y-2">
            {technician.documents.map((document) => (
              <DocumentRow key={document.id} document={document} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="verification-history">
          <h3
            id="verification-history"
            className="text-[13px] font-semibold text-ink"
          >
            Verification record
          </h3>
          <div className="mt-1.5 rounded-md border border-line bg-canvas/40 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone={verification.tone} dot>
                {verification.label}
              </Badge>
              <span className="text-[11.5px] text-ink-muted">
                Demo review state
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-secondary">
              {technician.verificationNote ??
                (technician.verification === "verified"
                  ? "All placeholder documents were accepted in the demo review."
                  : "No review note has been recorded yet.")}
            </p>
          </div>
        </section>

        {jobs.length > 0 ? (
          <section aria-labelledby="assigned-jobs">
            <h3
              id="assigned-jobs"
              className="text-[13px] font-semibold text-ink"
            >
              Assigned bookings
            </h3>
            <ul className="mt-1.5 divide-y divide-line rounded-md border border-line">
              {jobs.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2 text-[12px]"
                >
                  <span className="text-ink-secondary">
                    {booking.reference} · {booking.serviceName}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-muted">
                    {formatDate(booking.date)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          aria-labelledby="review-actions"
          className="rounded-md border border-line bg-canvas/40 p-3.5"
        >
          <h3 id="review-actions" className="text-[13px] font-semibold text-ink">
            Review decision
          </h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
            The note is internal demo context. Approving marks every placeholder
            document verified and allows dispatch assignment.
          </p>
          <label
            htmlFor="review-note"
            className="mt-2.5 block text-[12px] font-medium text-ink-secondary"
          >
            Review note
          </label>
          <textarea
            id="review-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="e.g. ID name matches the demo profile; skill certificate accepted."
            className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
          <div className="mt-2.5 flex flex-wrap justify-end gap-2">
            {canReject ? (
              <Button
                variant="danger"
                size="sm"
                disabled={!note.trim()}
                onClick={() => setConfirm("rejected")}
              >
                Reject
              </Button>
            ) : null}
            {canApprove ? (
              <Button size="sm" onClick={() => setConfirm("verified")}>
                Approve
              </Button>
            ) : (
              <Badge tone="success" dot>
                Already verified
              </Badge>
            )}
          </div>
        </section>

        <Notice tone="warning" className="py-2.5 text-[11.5px]">
          Demo approval does not change the seeded skills or coverage. It only
          updates this store&apos;s verification state and dispatch eligibility.
        </Notice>
      </div>

      <ConfirmDialog
        open={confirm === "verified"}
        title={`Approve ${technician.name}?`}
        description="Every pending placeholder document is marked verified. The technician becomes assignable in bookings, and the shared technician record updates everywhere it is shown. This is a simulated approval."
        confirmLabel="Approve technician"
        cancelLabel="Keep pending"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const ok = decideTechnician(technician.id, "verified", note);
          setConfirm(null);
          notify(
            ok
              ? `${technician.name} approved. Placeholder documents marked verified.`
              : "This decision could not be saved.",
          );
        }}
      />

      <ConfirmDialog
        open={confirm === "rejected"}
        title={`Reject ${technician.name}?`}
        description={`Pending documents will be marked rejected and the note will be stored as the review reason. Reason: "${note.trim() || "No note"}"`}
        confirmLabel="Reject technician"
        cancelLabel="Keep review open"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const ok = decideTechnician(technician.id, "rejected", note);
          setConfirm(null);
          notify(
            ok
              ? `${technician.name} rejected. Review note saved.`
              : "This decision could not be saved.",
          );
        }}
      />
    </AdminDrawer>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 rounded-md border border-line px-3 py-2">
      <Icon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-ink-muted" />
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[12px] leading-relaxed text-ink-secondary">
          {value}
        </p>
      </div>
    </div>
  );
}

function DocumentRow({ document }: { document: TechnicianDocument }) {
  const meta = verificationMeta[document.status];
  return (
    <li className="rounded-md border border-line p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-[#f2f4f7] text-ink-muted">
            <FileText aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-ink">{document.name}</p>
            <p className="text-[11px] text-ink-muted">
              {documentKindLabel[document.kind]} · uploaded{" "}
              {formatDate(document.uploadedAt.slice(0, 10))}
            </p>
          </div>
        </div>
        <Badge tone={meta.tone} dot>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
        {document.note}
      </p>
    </li>
  );
}
