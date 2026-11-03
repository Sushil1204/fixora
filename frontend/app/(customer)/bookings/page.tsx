import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { buttonStyles } from "@/components/ui/button";
import { BookingsView, type TabId } from "@/components/bookings/bookings-view";

export const metadata: Metadata = {
  title: "Bookings",
  description:
    "Track upcoming visits, review completed bookings and see cancellation details.",
};

const TABS: TabId[] = ["upcoming", "completed", "cancelled"];

interface BookingsPageProps {
  searchParams: Promise<{ tab?: string; demoState?: string }>;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const { tab, demoState } = await searchParams;
  const initialTab = TABS.includes(tab as TabId) ? (tab as TabId) : "upcoming";

  return (
    <Container>
      <PageHeader
        title="Bookings"
        description="Every visit you've requested, with its status, estimate and reference code."
        actions={
          <Link href="/services" className={buttonStyles({ size: "md" })}>
            Book a repair
          </Link>
        }
      />

      <div className="mt-6">
        <BookingsView
          initialTab={initialTab}
          initialError={demoState === "error"}
        />
      </div>
    </Container>
  );
}
