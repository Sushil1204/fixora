"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, LayoutGrid, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Home", Icon: House },
  { href: "/services", label: "Services", Icon: LayoutGrid },
  { href: "/bookings", label: "Bookings", Icon: CalendarDays },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Fixed mobile navigation. The app shell reserves matching bottom padding so
 * page content and sticky CTAs never sit underneath this bar.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex h-[var(--bottom-nav-h)] max-w-md items-stretch">
        {items.map(({ href, label, Icon }) => {
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
  );
}
