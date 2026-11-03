import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  /** Use white text when sitting on a dark surface */
  onDark?: boolean;
  href?: string;
}

/**
 * Fixora wordmark: a compact "roof + wrench" mark inside a rounded square,
 * paired with a tight, confident wordmark.
 */
export function Logo({ className, onDark, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Fixora home"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4",
        onDark && "focus-visible:outline-white",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 place-items-center rounded-md",
          onDark ? "bg-white/12 text-white" : "bg-brand text-white",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Roof */}
          <path d="M3.5 11.2 12 4l8.5 7.2" />
          {/* Wrench across the house body */}
          <path d="M7 20v-4.4h10V20" />
          <path d="m13.2 10.4 3.1 3.1" />
          <path d="M14.4 9.2a2.3 2.3 0 0 0 3.2 3.2l1.4 1.4a1.6 1.6 0 0 1-2.2 2.2l-1.4-1.4a2.3 2.3 0 0 1-3.2-3.2Z" />
        </svg>
      </span>
      <span
        className={cn(
          "text-[19px] font-[680] tracking-[-0.015em]",
          onDark ? "text-white" : "text-ink",
        )}
      >
        Fixora
      </span>
    </Link>
  );
}
