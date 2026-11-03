import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SERVICE_CATEGORIES, getServicesByCategory } from "@/lib/mock-data";
import { CategoryIcon } from "@/components/shell/category-icon";

/** Category discovery tiles — the fastest path from intent to a service list. */
export function CategoryGrid() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {SERVICE_CATEGORIES.map((category) => {
        const count = getServicesByCategory(category.id).length;
        return (
          <li key={category.id}>
            <Link
              href={`/services?category=${category.id}`}
              className="group relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-lg border border-line bg-surface p-4 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-brand-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <span className="relative flex items-start justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand ring-1 ring-inset ring-brand/10 transition-colors duration-200 group-hover:bg-brand group-hover:text-white group-hover:ring-brand">
                  <CategoryIcon icon={category.icon} className="size-5" />
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-line-strong transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </span>

              <span className="relative min-w-0">
                <span className="block text-[15px] font-semibold leading-snug text-ink">
                  {category.name}
                </span>
                <span className="mt-1 hidden text-[12.5px] leading-snug text-ink-muted sm:block">
                  {category.description}
                </span>
                <span className="mt-2 inline-flex items-center rounded-sm bg-canvas px-1.5 py-0.5 text-[11.5px] font-medium tabular-nums text-ink-muted transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                  {count} services
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
