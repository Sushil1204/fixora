import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Container } from "@/components/shell/app-shell";
import { Footer } from "@/components/shell/footer";
import { SearchForm } from "@/components/services/search-form";
import { CategoryGrid } from "@/components/services/category-grid";
import { ServiceCard } from "@/components/services/service-card";
import { UpcomingBookingCard } from "@/components/home/upcoming-booking-card";
import { PromoCarousel } from "@/components/home/promo-carousel";
import { popularServices } from "@/lib/mock-data";

const trustPoints = [
  {
    icon: ClipboardList,
    title: "You approve the estimate",
    body: "See the line-item breakdown before you confirm. Nothing is charged in this demo.",
  },
  {
    icon: Wrench,
    title: "Extra work needs your yes",
    body: "If inspection turns up more work, the technician raises a quote and waits for approval.",
  },
  {
    icon: CalendarCheck,
    title: "Cancellation terms up front",
    body: "The cancellation policy for your service is shown on the detail page and in the booking.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty terms in writing",
    body: "Each service states its labour warranty and what parts cover, before you book.",
  },
];

const steps = [
  {
    title: "Choose the repair",
    body: "Browse by category or search. Every card shows the starting price and estimated duration.",
  },
  {
    title: "Pick a slot and address",
    body: "Select a saved address or add one, then choose a two-hour arrival window.",
  },
  {
    title: "Review the estimate",
    body: "Service charge, convenience fee and tax are laid out before you confirm.",
  },
  {
    title: "Follow the visit",
    body: "The booking timeline shows each status change with a timestamp and a short explanation.",
  },
];

export default function CustomerHome() {
  const popular = popularServices();

  return (
    <>
      <h1 className="sr-only">
        Fixora — home repairs booked with an estimate you approve
      </h1>

      {/* Hero — a promotional container. Banners come from lib/promos.ts */}
      <Container bottomless>
        <PromoCarousel />
        <div className="mt-3 sm:mt-4">
          <SearchForm tone="hero" />
        </div>
      </Container>

      <Container className="pt-8 sm:pt-10">
        {/* Categories */}
        <section aria-labelledby="categories-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="categories-heading"
                className="text-[22px] font-[650] tracking-[-0.01em] text-ink sm:text-[26px]"
              >
                What needs fixing?
              </h2>
              <p className="mt-1 text-[15px] text-ink-muted">
                Six categories, each with a fixed starting price and scope.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 rounded-sm text-[14px] font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              All services
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-4">
            <CategoryGrid />
          </div>
        </section>

        <UpcomingBookingCard />

        {/* Popular services */}
        <section aria-labelledby="popular-heading" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="popular-heading"
                className="text-[22px] font-[650] tracking-[-0.01em] text-ink sm:text-[26px]"
              >
                Popular this week
              </h2>
              <p className="mt-1 text-[15px] text-ink-muted">
                The repairs customers ask for most often in the demo.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 rounded-sm text-[14px] font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Browse catalogue
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((service) => (
              <li key={service.slug}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <Footer />
    </>
  );
}
