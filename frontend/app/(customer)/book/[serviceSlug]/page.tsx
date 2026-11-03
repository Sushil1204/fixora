import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, IndianRupee } from "lucide-react";
import { Container } from "@/components/shell/app-shell";
import { BookingSheet } from "@/components/booking/booking-sheet";
import { getServiceBySlug, SERVICES } from "@/lib/mock-data";
import { formatDuration, formatINR } from "@/lib/format";

interface BookPageProps {
  params: Promise<{ serviceSlug: string }>;
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ serviceSlug: service.slug }));
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  return { title: service ? `Book ${service.name}` : "Book a service" };
}

export default async function BookServicePage({ params }: BookPageProps) {
  const { serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  if (!service) notFound();

  return (
    <Container className="max-w-4xl">
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1.5 rounded-sm text-[14px] font-medium text-ink-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to {service.name}
        </Link>
      </nav>

      <div className="mb-5">
        <h1 className="text-[24px] font-[680] leading-tight tracking-[-0.015em] text-ink sm:text-[30px]">
          Book {service.name.toLowerCase()}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <IndianRupee aria-hidden="true" className="size-4" />
            From {formatINR(service.startPrice)}, before parts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-4" />
            {formatDuration(service.durationMins)} estimated
          </span>
        </p>
      </div>

      <BookingSheet service={service} />
    </Container>
  );
}
