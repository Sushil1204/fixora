"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/mock-data";
import { ServiceCard } from "./service-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const ALL = "all";

interface ServiceCatalogProps {
  /** Filters arrive as props so the URL stays the entry point, not a sync loop */
  initialQuery?: string;
  initialCategory?: string;
  /** ?demoState=error — lets a demo walk through the recovery path */
  initialError?: boolean;
}

export function ServiceCatalog({
  initialQuery = "",
  initialCategory = ALL,
  initialError = false,
}: ServiceCatalogProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    initialError ? "error" : "loading",
  );
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  // Demo read: a short delay so the skeleton state is real and visible.
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 320);
    return () => clearTimeout(timer);
  }, [status]);

  const needle = query.trim().toLowerCase();
  const results = SERVICES.filter((service) => {
    if (category !== ALL && service.categoryId !== category) return false;
    if (!needle) return true;
    const categoryName =
      SERVICE_CATEGORIES.find((c) => c.id === service.categoryId)?.name ?? "";
    return (
      service.name.toLowerCase().includes(needle) ||
      service.shortDescription.toLowerCase().includes(needle) ||
      categoryName.toLowerCase().includes(needle)
    );
  });

  const activeCategory = SERVICE_CATEGORIES.find((c) => c.id === category);
  const hasFilters = query.trim().length > 0 || category !== ALL;

  function clearFilters() {
    setQuery("");
    setCategory(ALL);
  }

  return (
    <div>
      {/* Search + filters */}
      <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-muted"
          />
          <label htmlFor="catalog-search" className="sr-only">
            Search services
          </label>
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search repairs, e.g. “washing machine”"
            className="h-12 w-full rounded-md border border-line bg-surface pl-10 pr-10 text-[15px] text-ink placeholder:text-ink-muted hover:border-line-strong focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <SlidersHorizontal
            aria-hidden="true"
            className="size-4 shrink-0 text-ink-muted"
          />
          <div
            role="group"
            aria-label="Filter by category"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 scrollbar-none sm:flex-wrap sm:overflow-visible"
          >
            <FilterChip
              label="All services"
              active={category === ALL}
              onClick={() => setCategory(ALL)}
            />
            {SERVICE_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat.id}
                label={cat.name}
                active={category === cat.id}
                onClick={() => setCategory(cat.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Result meta */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-[14px] text-ink-muted">
          {status === "loading"
            ? "Loading services…"
            : status === "error"
              ? "Services unavailable"
              : `${results.length} ${
                  results.length === 1 ? "service" : "services"
                }${activeCategory ? ` in ${activeCategory.name}` : ""}`}
        </p>
        {hasFilters && status === "ready" ? (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* States */}
      {status === "loading" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : status === "error" ? (
        <div className="mt-4">
          <ErrorState
            title="Services didn't load"
            description="We couldn't read the service list. Try again — saved bookings are unaffected."
            onRetry={() => setStatus("loading")}
          />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Search}
            title="No services match that"
            description={`Nothing in the demo catalogue matches “${
              query.trim() || "this filter"
            }”. Try a different word or clear the filters to see everything.`}
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((service) => (
            <li key={service.slug}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-ink-secondary hover:border-line-strong hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
