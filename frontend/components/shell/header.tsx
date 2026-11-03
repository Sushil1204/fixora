"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { Logo } from "./logo";
import { LocationMenu } from "./location-menu";
import { NotificationBell } from "./notification-bell";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/bookings", label: "Bookings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      {/* Desktop header */}
      <div className="mx-auto hidden h-16 w-full max-w-6xl items-center gap-8 px-8 md:flex">
        <Logo />
        <nav aria-label="Primary" className="flex items-center gap-1">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-ink-secondary hover:bg-canvas hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <LocationMenu />
          <NotificationBell />
          <Link
            href="/profile"
            className="ml-1 flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-1.5 pr-3 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand"
            >
              <UserRound className="size-4" />
            </span>
            <span className="text-sm font-semibold text-ink">Profile</span>
          </Link>
        </div>
      </div>

      {/* Mobile top bar: brand, area, notifications */}
      <div className="flex h-14 w-full items-center justify-between gap-2 px-4 md:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <LocationMenu compact />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
