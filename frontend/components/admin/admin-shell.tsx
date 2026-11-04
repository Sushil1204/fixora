"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  PanelsTopLeft,
  RotateCcw,
  Scale,
  UserCog,
  Wrench,
  X,
} from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDemoStore } from "@/lib/store";
import { ADMIN_PROFILE, REPORTING_RANGES, formatRangePeriod } from "@/lib/admin";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", Icon: CalendarDays },
  { href: "/admin/technicians", label: "Technicians", Icon: Wrench },
  { href: "/admin/disputes", label: "Disputes", Icon: Scale },
  { href: "/admin/services", label: "Service catalogue", Icon: PanelsTopLeft },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function titleFor(pathname: string) {
  return NAV.find((item) => isActive(pathname, item.href))?.label ?? "Operations";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    technicians,
    disputes,
    bookings,
    reportingRange,
    hydrated,
    setReportingRange,
    resetDemo,
  } = useDemoStore();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const pendingTechnicians = technicians.filter(
    (technician) => technician.verification === "pending",
  ).length;
  const openDisputes = disputes.filter(
    (dispute) => dispute.status !== "resolved",
  ).length;
  const unassignedRequests = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;
  const alertCount = pendingTechnicians + openDisputes + unassignedRequests;

  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!alertsOpen && !accountOpen) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (alertsOpen && !alertsRef.current?.contains(target)) {
        setAlertsOpen(false);
      }
      if (accountOpen && !accountRef.current?.contains(target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [alertsOpen, accountOpen]);

  function navigate() {
    setMobileOpen(false);
    setAlertsOpen(false);
    setAccountOpen(false);
  }

  const sidebar = (mobile: boolean) => {
    const compact = !mobile && collapsed;
    return (
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-white/10",
            compact ? "justify-center px-2" : "justify-between gap-2 px-4",
          )}
        >
          <Logo
            href="/admin"
            onDark
            showWordmark={!compact}
            className={compact ? "gap-0" : undefined}
          />
          {!compact && !mobile ? (
            <span className="rounded-sm bg-white/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/90">
              Ops
            </span>
          ) : null}
        </div>

        <nav aria-label="Operations" className="flex-1 overflow-y-auto px-2 py-4">
          {!compact ? (
            <p className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Operations
            </p>
          ) : null}
          <ul className="space-y-1">
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(pathname, href);
              const badge =
                href === "/admin/technicians"
                  ? pendingTechnicians
                  : href === "/admin/disputes"
                    ? openDisputes
                    : href === "/admin/bookings"
                      ? unassignedRequests
                      : 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={navigate}
                    aria-current={active ? "page" : undefined}
                    title={compact ? label : undefined}
                    className={cn(
                      "group relative flex items-center rounded-md text-[13.5px] font-medium transition-colors",
                      compact
                        ? "h-10 justify-center px-0"
                        : "h-10 justify-between gap-2 px-2.5",
                      active
                        ? "bg-white/14 text-white"
                        : "text-white/70 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex min-w-0 items-center gap-2.5",
                        compact && "justify-center",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                      <span className={compact ? "sr-only" : "truncate"}>
                        {label}
                      </span>
                    </span>
                    {badge > 0 ? (
                      <span
                        className={cn(
                          "grid min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold tabular-nums",
                          active
                            ? "bg-white text-brand-deep"
                            : "bg-white/16 text-white",
                          compact &&
                            "absolute right-1 top-1 size-4 min-w-0 px-0 text-[9px] leading-4",
                        )}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-md",
              compact && "justify-center",
            )}
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-white/16 text-[12px] font-semibold text-white"
            >
              {ADMIN_PROFILE.initials}
            </span>
            {!compact ? (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">
                  {ADMIN_PROFILE.name}
                </p>
                <p className="truncate text-[11.5px] text-white/55">
                  {ADMIN_PROFILE.role} · Demo account
                </p>
              </div>
            ) : null}
          </div>

          {!compact ? (
            <div className="mt-2.5 space-y-0.5 text-[12px]">
              <Link
                href="/"
                onClick={navigate}
                className="block rounded-sm px-2 py-1.5 text-white/65 transition-colors hover:bg-white/8 hover:text-white"
              >
                Customer portal
              </Link>
              <Link
                href="/technician"
                onClick={navigate}
                className="block rounded-sm px-2 py-1.5 text-white/65 transition-colors hover:bg-white/8 hover:text-white"
              >
                Technician portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResetOpen(true);
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-white/55 transition-colors hover:bg-white/8 hover:text-white"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                Reset demo data
              </button>
            </div>
          ) : null}
        </div>

        {!mobile ? (
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-11 items-center justify-center border-t border-white/10 text-white/55 transition-colors hover:bg-white/8 hover:text-white lg:flex"
          >
            {collapsed ? (
              <ChevronRight aria-hidden="true" className="size-4" />
            ) : (
              <ChevronLeft aria-hidden="true" className="size-4" />
            )}
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col bg-brand-deep transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        {sidebar(false)}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="admin-backdrop-enter absolute inset-0 bg-[#101828]/60"
          />
          <div className="admin-sidebar-enter relative h-full w-72 max-w-[85vw] bg-brand-deep shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3.5 z-10 grid size-9 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Close navigation</span>
            </button>
            {sidebar(true)}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64",
        )}
      >
        <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
          <div className="flex min-h-14 flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2.5 sm:px-6 lg:h-16 lg:flex-nowrap lg:px-8 lg:py-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 shrink-0 place-items-center rounded-md text-ink-secondary hover:bg-canvas lg:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open navigation</span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="hidden text-[10.5px] font-semibold uppercase tracking-[0.13em] text-ink-muted sm:block">
                Operations portal
              </p>
              <h1 className="truncate text-[15px] font-semibold leading-tight text-ink sm:text-[16px]">
                {titleFor(pathname)}
              </h1>
            </div>

            <div className="order-last flex w-full items-center justify-between gap-2 lg:order-none lg:w-auto">
              <label className="flex h-9 items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5">
                <CalendarRange
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-muted"
                />
                <span className="sr-only">Reporting period</span>
                <select
                  value={reportingRange}
                  onChange={(event) =>
                    setReportingRange(
                      event.target.value as (typeof REPORTING_RANGES)[number]["id"],
                    )
                  }
                  className="h-8 cursor-pointer bg-transparent text-[12.5px] font-semibold text-ink-secondary outline-none"
                >
                  {REPORTING_RANGES.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="hidden text-[11.5px] text-ink-muted xl:block">
                {hydrated ? formatRangePeriod(reportingRange) : "Demo period"}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <div ref={alertsRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAlertsOpen((value) => !value);
                    setAccountOpen(false);
                  }}
                  aria-expanded={alertsOpen}
                  aria-haspopup="true"
                  className="relative grid size-9 place-items-center rounded-md text-ink-secondary transition-colors hover:bg-canvas hover:text-ink"
                >
                  <Bell aria-hidden="true" className="size-[18px]" />
                  {alertCount > 0 ? (
                    <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-danger px-0.5 text-[9.5px] font-bold leading-4 text-white">
                      {alertCount}
                    </span>
                  ) : null}
                  <span className="sr-only">
                    System alerts: {alertCount} open items
                  </span>
                </button>

                {alertsOpen ? (
                  <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-line bg-surface shadow-md">
                    <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
                      <p className="text-[13px] font-semibold text-ink">
                        Needs attention
                      </p>
                      <span className="text-[11.5px] text-ink-muted">
                        {alertCount} items
                      </span>
                    </div>
                    <ul className="divide-y divide-line">
                      <AlertRow
                        href="/admin/technicians?status=pending"
                        label="Technician approvals"
                        detail="Documents waiting for review"
                        count={pendingTechnicians}
                        onClick={navigate}
                      />
                      <AlertRow
                        href="/admin/disputes"
                        label="Open disputes"
                        detail="Open or under investigation"
                        count={openDisputes}
                        onClick={navigate}
                      />
                      <AlertRow
                        href="/admin/bookings?status=requested"
                        label="Unassigned requests"
                        detail="Customers waiting for dispatch"
                        count={unassignedRequests}
                        onClick={navigate}
                      />
                    </ul>
                    <p className="bg-canvas/60 px-3.5 py-2 text-[11px] text-ink-muted">
                      Counts come from this demo store only.
                    </p>
                  </div>
                ) : null}
              </div>

              <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-line" />

              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((value) => !value);
                    setAlertsOpen(false);
                  }}
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                  className="flex h-9 items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-canvas"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-7 place-items-center rounded-full bg-brand-deep text-[10.5px] font-semibold text-white"
                  >
                    {ADMIN_PROFILE.initials}
                  </span>
                  <span className="hidden min-w-0 lg:block">
                    <span className="block max-w-32 truncate text-[12.5px] font-semibold leading-tight text-ink">
                      {ADMIN_PROFILE.name}
                    </span>
                    <span className="block text-[10.5px] text-ink-muted">
                      Demo admin
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="hidden size-3.5 text-ink-muted lg:block"
                  />
                  <span className="sr-only">Admin account menu</span>
                </button>

                {accountOpen ? (
                  <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-md">
                    <div className="border-b border-line px-3.5 py-3">
                      <p className="text-[13px] font-semibold text-ink">
                        {ADMIN_PROFILE.name}
                      </p>
                      <p className="truncate text-[11.5px] text-ink-muted">
                        {ADMIN_PROFILE.email}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-sm bg-brand-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-brand">
                        <UserCog aria-hidden="true" className="size-3" />
                        Demo operations account
                      </span>
                    </div>
                    <div className="p-1.5 text-[12.5px]">
                      <Link
                        href="/"
                        onClick={navigate}
                        className="block rounded-sm px-2.5 py-2 text-ink-secondary hover:bg-canvas hover:text-ink"
                      >
                        Open customer portal
                      </Link>
                      <Link
                        href="/technician"
                        onClick={navigate}
                        className="block rounded-sm px-2.5 py-2 text-ink-secondary hover:bg-canvas hover:text-ink"
                      >
                        Open technician portal
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setResetOpen(true);
                          setAccountOpen(false);
                        }}
                        className="flex w-full items-center gap-1.5 rounded-sm px-2.5 py-2 text-left text-danger hover:bg-danger-soft"
                      >
                        <RotateCcw aria-hidden="true" className="size-3.5" />
                        Reset demo data
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset all demo data?"
        description="This clears every simulated change — bookings, approvals, disputes and catalogue edits — and restores the original seed data. It cannot be undone."
        confirmLabel="Reset demo"
        cancelLabel="Keep my changes"
        destructive
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo();
          setResetOpen(false);
        }}
      />
    </div>
  );
}

function AlertRow({
  href,
  label,
  detail,
  count,
  onClick,
}: {
  href: string;
  label: string;
  detail: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-brand-subtle"
      >
        <span className="min-w-0">
          <span className="block text-[12.5px] font-medium text-ink">
            {label}
          </span>
          <span className="block text-[11px] text-ink-muted">{detail}</span>
        </span>
        <span
          className={cn(
            "grid min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
            count > 0 ? "bg-warning-soft text-warning" : "bg-[#f2f4f7] text-ink-muted",
          )}
        >
          {count}
        </span>
      </Link>
    </li>
  );
}
