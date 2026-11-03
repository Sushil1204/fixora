import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { getCategoryById } from "@/lib/mock-data";
import { formatDuration, formatINR } from "@/lib/format";
import type { Service } from "@/lib/types";
import { CategoryIcon } from "@/components/shell/category-icon";

/**
 * Service card. Information order is fixed across the app:
 * category → name → scope → price and duration → action.
 */
export function ServiceCard({ service }: { service: Service }) {
  const category = getCategoryById(service.categoryId);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-brand/40 hover:bg-brand-subtle/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand">
          {category ? (
            <CategoryIcon icon={category.icon} className="size-5" />
          ) : null}
        </span>
        {service.popular ? (
          <span className="rounded-sm bg-accent-soft px-2 py-1 text-[12px] font-semibold text-accent-strong">
            Popular
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-[17px] font-semibold leading-snug text-ink">
        {service.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-ink-muted">
        {service.shortDescription}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
        <p className="min-w-0">
          <span className="text-[12px] font-medium text-ink-muted">From </span>
          <span className="text-[16px] font-semibold text-ink">
            {formatINR(service.startPrice)}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-muted">
            <Clock aria-hidden="true" className="size-3.5" />
            {formatDuration(service.durationMins)} estimated
          </span>
        </p>
        <span className="flex items-center gap-0.5 text-[13px] font-semibold text-brand">
          Details
          <ChevronRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
