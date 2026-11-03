import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-[#e9edf3]", className)}
    />
  );
}

/** Card-shaped loading placeholder used by list screens. */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3 max-w-56" />
          <Skeleton className="h-4 w-1/2 max-w-40" />
        </div>
        <Skeleton className="h-7 w-20 rounded-sm" />
      </div>
      <div className="mt-5 flex gap-3">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

/** Announced to assistive tech while a list loads. */
export function LoadingRegion({ label }: { label: string }) {
  return (
    <p role="status" className="sr-only">
      {label}
    </p>
  );
}
