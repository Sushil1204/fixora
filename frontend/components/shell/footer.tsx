import Link from "next/link";
import { Logo } from "./logo";
import { SERVICE_CATEGORIES } from "@/lib/mock-data";

const columns = [
  {
    title: "Services",
    links: SERVICE_CATEGORIES.slice(0, 4).map((c) => ({
      label: c.name,
      href: `/services?category=${c.id}`,
    })),
  },
  {
    title: "Your account",
    links: [
      { label: "Bookings", href: "/bookings" },
      { label: "Notifications", href: "/notifications" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help & support", href: "/support" },
      { label: "Cancellation terms", href: "/legal#cancellation" },
      { label: "Privacy policy", href: "/legal#privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-14 border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
              A home-repair booking experience with clear estimates, approval
              before extra work, and a status timeline for every visit.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-[13px] font-semibold text-ink">
                {column.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-[14px] text-ink-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Fixora. Product demonstration.</p>
          <p>
            Fictional services, technicians and payments. No real bookings or
            transactions are created.
          </p>
        </div>
      </div>
    </footer>
  );
}
