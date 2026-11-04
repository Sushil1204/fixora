"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, UserRound, Wallet, Wrench } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { AvailabilityToggle } from "./availability-toggle";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/technician", label: "Jobs", Icon: Wrench },
  { href: "/technician/availability", label: "Availability", Icon: CalendarClock },
  { href: "/technician/earnings", label: "Earnings", Icon: Wallet },
  { href: "/technician/profile", label: "Profile", Icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/technician") {
    return pathname === "/technician" || pathname.startsWith("/technician/jobs");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Technician shell: task-first mobile layout with a fixed four-tab bar, and a
 * compact top bar that keeps availability one tap away on every screen.
 */
export function TechShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16 md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Logo href="/technician" />
            <span className="rounded-sm bg-brand-deep px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              Pro
            </span>
          </div>

          <nav aria-label="Technician" className="hidden items-center gap-0.5 md:flex">
            {tabs.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-[13.5px] font-semibold transition-colors",
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-ink-secondary hover:bg-canvas hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-sm px-1 text-[13px] font-semibold text-ink-muted transition-colors hover:text-brand md:inline"
            >
              Customer view
            </Link>
            <AvailabilityToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <nav
        aria-label="Technician"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto flex h-[var(--bottom-nav-h)] max-w-md items-stretch">
          {tabs.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                    active ? "text-brand" : "text-ink-muted hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-12 place-items-center rounded-full transition-colors",
                      active && "bg-brand-soft",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-[20px]" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Page container with room reserved for the mobile tab bar and job action bar. */
export function ProContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl px-4 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+6.5rem)] pt-5 sm:px-6 md:px-8 md:pb-12 md:pt-7",
        className,
      )}
    >
      {children}
    </div>
  );
}
