"use client";

import { useState } from "react";
import {
  Archive,
  Clock3,
  IndianRupee,
  PencilLine,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { SERVICE_CATEGORIES } from "@/lib/mock-data";
import { formatDate, formatDuration, formatINR } from "@/lib/format";
import { catalogStatusMeta } from "@/lib/admin";
import type { CatalogEntry, CatalogStatus, ServiceCategoryId } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { CategoryIcon } from "@/components/shell/category-icon";
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

type StatusFilter = "all" | CatalogStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All publication states" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const categoryName = (id: ServiceCategoryId) =>
  SERVICE_CATEGORIES.find((category) => category.id === id)?.name ?? id;

const categoryIcon = (id: ServiceCategoryId) =>
  SERVICE_CATEGORIES.find((category) => category.id === id)?.icon ?? "hammer";

export function ServicesView() {
  const { catalog, hydrated } = useDemoStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ServiceCategoryId | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<CatalogEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!hydrated) return <AdminPageSkeleton cards={3} />;

  const filtered = catalog.filter((entry) => {
    if (category !== "all" && entry.categoryId !== category) return false;
    if (status !== "all" && entry.status !== status) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return [
      entry.name,
      entry.shortDescription,
      entry.slug,
      categoryName(entry.categoryId),
      entry.priceBasis ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const counts = {
    live: catalog.filter((entry) => entry.status === "live").length,
    draft: catalog.filter((entry) => entry.status === "draft").length,
    archived: catalog.filter((entry) => entry.status === "archived").length,
  };
  const hasFilters =
    Boolean(query) || category !== "all" || status !== "all";

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setStatus("all");
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Service catalogue"
        description="Operations view of the demo service records: price basis, availability, publication state and last edit."
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <DemoTag />
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setCreating(true);
              }}
            >
              <Plus aria-hidden="true" className="size-4" />
              Add service
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {(["live", "draft", "archived"] as const).map((entry) => {
          const meta = catalogStatusMeta[entry];
          return (
            <div
              key={entry}
              className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-[12px] text-ink-muted">{meta.label}</p>
                <p className="mt-0.5 text-[20px] font-[680] tabular-nums text-ink">
                  {counts[entry]}
                </p>
              </div>
              <Badge tone={meta.tone} dot>
                {meta.label}
              </Badge>
            </div>
          );
        })}
      </div>

      <AdminSection
        id="catalogue"
        title="Catalogue records"
        description={`${filtered.length} of ${catalog.length} demo services`}
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
        <div className="grid gap-2.5 border-b border-line bg-canvas/40 px-4 py-3 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1fr)_190px_200px]">
          <label className="relative block">
            <span className="sr-only">Search services</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Service name, description or price basis"
              className={`${adminField} pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ServiceCategoryId | "all")
              }
              className={adminSelect}
            >
              <option value="all">All categories</option>
              {SERVICE_CATEGORIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by publication state</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              className={adminSelect}
            >
              {STATUS_FILTERS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length > 0 ? (
          <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((entry) => {
              const meta = catalogStatusMeta[entry.status];
              return (
                <li
                  key={entry.slug}
                  className="flex flex-col rounded-lg border border-line bg-surface p-3.5 shadow-sm transition-colors hover:border-brand/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                      <CategoryIcon
                        icon={categoryIcon(entry.categoryId)}
                        className="size-5"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13.5px] font-semibold leading-snug text-ink">
                          {entry.name}
                        </p>
                        <Badge tone={meta.tone} dot className="shrink-0">
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11.5px] text-ink-muted">
                        {categoryName(entry.categoryId)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-secondary">
                    {entry.shortDescription}
                  </p>

                  <dl className="mt-2.5 space-y-1 border-t border-line pt-2.5 text-[11.5px]">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-1 text-ink-muted">
                        <IndianRupee aria-hidden="true" className="size-3" />
                        Price basis
                      </dt>
                      <dd className="text-right font-medium text-ink">
                        From {formatINR(entry.startPrice)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-ink-muted">How it is charged</dt>
                      <dd className="max-w-[62%] text-right text-ink-secondary">
                        {entry.priceBasis || "Final quote after inspection"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-1 text-ink-muted">
                        <Clock3 aria-hidden="true" className="size-3" />
                        Duration
                      </dt>
                      <dd className="text-ink-secondary">
                        {formatDuration(entry.durationMins)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-ink-muted">Availability</dt>
                      <dd className="text-ink-secondary">
                        {entry.status === "live"
                          ? "Bookable in demo"
                          : "Not bookable"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                    <p className="text-[10.5px] text-ink-muted">
                      Updated {formatDate(entry.updatedAt.slice(0, 10))}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setEditing(entry);
                      }}
                      className="inline-flex items-center gap-1 rounded-sm px-1.5 py-1 text-[12px] font-semibold text-brand hover:bg-brand-soft"
                    >
                      <PencilLine aria-hidden="true" className="size-3.5" />
                      Edit
                      <span className="sr-only"> {entry.name}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Search}
              title="No services match"
              description="Try a different category, publication state or search term."
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

      <Notice tone="info" className="text-[12px]">
        <strong>Operations demo only.</strong> Catalogue edits update this local
        admin store. The customer storefront still renders the original seeded
        service list, so changes here are not published to customers.
      </Notice>

      {creating || editing ? (
        <CatalogDrawer
          key={editing?.slug ?? "new"}
          entry={editing}
          existingSlugs={catalog.map((item) => item.slug)}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          notify={setToast}
        />
      ) : null}

      <AdminToast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CatalogDrawer({
  entry,
  existingSlugs,
  onClose,
  notify,
}: {
  entry: CatalogEntry | null;
  existingSlugs: string[];
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const { saveCatalogEntry, setCatalogStatus } = useDemoStore();
  const [name, setName] = useState(entry?.name ?? "");
  const [description, setDescription] = useState(entry?.shortDescription ?? "");
  const [categoryId, setCategoryId] = useState<ServiceCategoryId>(
    entry?.categoryId ?? "plumbing",
  );
  const [startPrice, setStartPrice] = useState(String(entry?.startPrice ?? 499));
  const [duration, setDuration] = useState(
    String(entry?.durationMins ?? 60),
  );
  const [priceBasis, setPriceBasis] = useState(
    entry?.priceBasis ??
      "Starting price · parts and extra work quoted after inspection",
  );
  const [status, setStatus] = useState<CatalogStatus>(
    entry?.status ?? "draft",
  );
  const [confirmArchive, setConfirmArchive] = useState(false);

  const priceValue = Number(startPrice);
  const durationValue = Number(duration);
  const valid =
    name.trim().length >= 3 &&
    description.trim().length >= 10 &&
    priceBasis.trim().length >= 5 &&
    Number.isFinite(priceValue) &&
    priceValue > 0 &&
    Number.isFinite(durationValue) &&
    durationValue >= 15;

  function save() {
    if (!valid) return;
    const baseSlug = entry?.slug ?? slugify(name);
    let slug = baseSlug || "demo-service";
    if (!entry) {
      let suffix = 2;
      while (existingSlugs.includes(slug)) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
    }

    const record: CatalogEntry = {
      ...(entry ?? {
        slug,
        name: "",
        categoryId,
        shortDescription: "",
        startPrice: 0,
        durationMins: 60,
        popular: false,
        includedWork: [],
        exclusions: [],
        additionalCharges: [],
        cancellationPolicy:
          "Free cancellation up to 4 hours before the demo visit.",
        warrantySummary: "30-day demo workmanship warranty.",
      }),
      slug,
      name: name.trim(),
      shortDescription: description.trim(),
      categoryId,
      startPrice: Math.round(priceValue),
      durationMins: Math.round(durationValue),
      priceBasis: priceBasis.trim(),
      status,
      updatedAt: new Date().toISOString(),
    };

    saveCatalogEntry(record);
    notify(
      entry
        ? `${record.name} updated in the demo catalogue.`
        : `${record.name} added as ${catalogStatusMeta[status].label.toLowerCase()}.`,
    );
    onClose();
  }

  return (
    <AdminDrawer
      open
      onClose={onClose}
      title={entry ? `Edit ${entry.name}` : "Add a service"}
      subtitle={
        entry
          ? `${entry.slug} · last updated ${formatDate(entry.updatedAt.slice(0, 10))}`
          : "New operations-only demo catalogue record"
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          {entry ? (
            entry.status === "archived" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCatalogStatus(entry.slug, "live");
                  notify(`${entry.name} restored as live.`);
                  onClose();
                }}
              >
                Restore as live
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmArchive(true)}
              >
                <Archive aria-hidden="true" className="size-4" />
                Archive
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" disabled={!valid} onClick={save}>
              {entry ? "Save changes" : "Add service"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="service-name"
            className="text-[12.5px] font-medium text-ink-secondary"
          >
            Service name
          </label>
          <input
            id="service-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`${adminField} mt-1`}
            placeholder="e.g. Ceiling fan installation"
          />
          {!entry ? (
            <p className="mt-1 text-[11px] text-ink-muted">
              Slug preview:{" "}
              <code className="rounded-sm bg-canvas px-1 py-0.5">
                {slugify(name) || "demo-service"}
              </code>
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="service-description"
            className="text-[12.5px] font-medium text-ink-secondary"
          >
            Short description
          </label>
          <textarea
            id="service-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            placeholder="What the customer gets in this demo service…"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="service-category"
              className="text-[12.5px] font-medium text-ink-secondary"
            >
              Category
            </label>
            <select
              id="service-category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value as ServiceCategoryId)
              }
              className={`${adminSelect} mt-1`}
            >
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="service-status"
              className="text-[12.5px] font-medium text-ink-secondary"
            >
              Publication
            </label>
            <select
              id="service-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as CatalogStatus)
              }
              className={`${adminSelect} mt-1`}
            >
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              {entry?.status === "archived" ? (
                <option value="archived" disabled>
                  Archived
                </option>
              ) : null}
            </select>
            <p className="mt-1 text-[11px] text-ink-muted">
              Archive uses a confirmation step.
            </p>
          </div>
          <div>
            <label
              htmlFor="service-price"
              className="text-[12.5px] font-medium text-ink-secondary"
            >
              Starting price (₹)
            </label>
            <input
              id="service-price"
              type="number"
              min={1}
              step={50}
              value={startPrice}
              onChange={(event) => setStartPrice(event.target.value)}
              className={`${adminField} mt-1`}
            />
          </div>
          <div>
            <label
              htmlFor="service-duration"
              className="text-[12.5px] font-medium text-ink-secondary"
            >
              Duration (minutes)
            </label>
            <input
              id="service-duration"
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className={`${adminField} mt-1`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="service-price-basis"
            className="text-[12.5px] font-medium text-ink-secondary"
          >
            Price basis
          </label>
          <input
            id="service-price-basis"
            value={priceBasis}
            onChange={(event) => setPriceBasis(event.target.value)}
            className={`${adminField} mt-1`}
            placeholder="e.g. Starting price · final quote after inspection"
          />
          <p className="mt-1 text-[11px] text-ink-muted">
            Shown in the catalogue so the pricing model is explicit. No real
            charge is calculated here.
          </p>
        </div>

        {entry?.status === "archived" ? (
          <Notice tone="warning" className="py-2.5 text-[12px]">
            This service is archived and marked not bookable. Restore it from
            the drawer footer to make it live again.
          </Notice>
        ) : null}

        <Notice tone="info" className="py-2.5 text-[11.5px]">
          Changes stay in the operations demo store and do not alter the
          customer-facing service list.
        </Notice>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        title={`Archive ${entry?.name ?? "this service"}?`}
        description="Archiving retires this demo catalogue record and marks it not bookable. Existing bookings keep their service name. You can restore it later."
        confirmLabel="Archive service"
        cancelLabel="Keep live"
        destructive
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => {
          if (!entry) return;
          setCatalogStatus(entry.slug, "archived");
          setConfirmArchive(false);
          notify(`${entry.name} archived. It is no longer bookable in the demo.`);
          onClose();
        }}
      />
    </AdminDrawer>
  );
}
