import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { BookingDetail } from "@/components/bookings/booking-detail";

interface BookingDetailPageProps {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ created?: string }>;
}

export const metadata: Metadata = {
  title: "Booking details",
  description:
    "Address, estimate breakdown, status timeline and support actions for one booking.",
};

export default async function BookingDetailPage({
  params,
  searchParams,
}: BookingDetailPageProps) {
  const { bookingId } = await params;
  const { created } = await searchParams;

  return (
    <Container>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 rounded-sm text-[14px] font-medium text-ink-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All bookings
        </Link>
      </nav>

      <PageHeader
        title="Booking details"
        description="What you booked, what it's expected to cost, and where the visit currently stands."
        className="mb-5"
      />

      <BookingDetail bookingId={bookingId} justCreated={created === "1"} />
    </Container>
  );
}
