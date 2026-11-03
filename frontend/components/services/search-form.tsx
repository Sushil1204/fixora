import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchFormProps {
  /** Prefill (used by the catalog page) */
  defaultValue?: string;
  /** "hero" is the full-width bar under the home promo panel; "inline" is the plain field pair */
  tone?: "hero" | "inline";
  className?: string;
}

/**
 * Plain GET form — search works without JavaScript by landing on
 * /services?q=… and is progressively enhanced by the catalog filters.
 */
export function SearchForm({ defaultValue, tone = "inline", className }: SearchFormProps) {
  const isHero = tone === "hero";

  return (
    <form
      action="/services"
      method="get"
      role="search"
      className={cn(
        "flex w-full items-center",
        isHero
          ? "gap-1.5 rounded-lg border border-line bg-surface p-1.5 shadow-sm transition-shadow focus-within:border-brand focus-within:shadow-md sm:rounded-xl"
          : "gap-2",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-muted"
        />
        <label htmlFor={`service-search-${tone}`} className="sr-only">
          Search for a repair service
        </label>
        <input
          id={`service-search-${tone}`}
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Try “AC service” or “tap repair”"
          className={cn(
            "w-full text-[15px] text-ink placeholder:text-ink-muted sm:text-[16px]",
            isHero
              ? "h-11 rounded-md border-0 bg-transparent pl-10 pr-3 focus-visible:outline-none sm:h-12"
              : "h-12 rounded-md border border-line bg-surface pl-10 pr-3 hover:border-line-strong focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand",
          )}
        />
      </div>
      <button
        type="submit"
        className={cn(
          "h-11 shrink-0 rounded-md bg-brand px-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep sm:h-12 sm:px-6",
        )}
      >
        Search
      </button>
    </form>
  );
}
