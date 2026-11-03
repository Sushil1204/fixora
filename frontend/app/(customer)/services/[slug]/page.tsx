import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  IndianRupee,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { Container } from "@/components/shell/app-shell";
import { CategoryIcon } from "@/components/shell/category-icon";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { buttonStyles } from "@/components/ui/button";
import { getCategoryById, getServiceBySlug, SERVICES } from "@/lib/mock-data";
import { formatDuration, formatINR } from "@/lib/format";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.name,
    description: `${service.shortDescription} From ${formatINR(
      service.startPrice,
    )}.`,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const category = getCategoryById(service.categoryId);

  return (
    <Container bottomless>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 rounded-sm text-[14px] font-medium text-ink-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All services
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0">
          {/* Illustration placeholder + identity */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="relative flex h-40 items-center justify-center bg-brand-soft sm:h-52">
              <div className="flex items-center gap-3 text-brand">
                {category ? (
                  <CategoryIcon icon={category.icon} className="size-14" />
                ) : null}
                <span className="text-[15px] font-semibold">
                  {category?.name}
                </span>
              </div>
              <p className="absolute bottom-2 right-3 text-[11px] font-medium text-brand/60">
                Illustration placeholder
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {category ? <Badge tone="brand">{category.name}</Badge> : null}
                {service.popular ? (
                  <Badge tone="accent">Popular</Badge>
                ) : null}
              </div>

              <h1 className="mt-3 text-balance text-[28px] font-[680] leading-tight tracking-[-0.015em] text-ink sm:text-[34px]">
                {service.name}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-secondary sm:text-base">
                {service.shortDescription}
              </p>

              <dl className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[12px] font-medium text-ink-muted">
                    Starting price
                  </dt>
                  <dd className="mt-0.5 text-[17px] font-semibold text-ink">
                    {formatINR(service.startPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] font-medium text-ink-muted">
                    Estimated duration
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-[17px] font-semibold text-ink">
                    <Clock aria-hidden="true" className="size-4 text-ink-muted" />
                    {formatDuration(service.durationMins)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] font-medium text-ink-muted">
                    Price basis
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-[15px] font-medium text-ink">
                    <IndianRupee
                      aria-hidden="true"
                      className="size-4 text-ink-muted"
                    />
                    Per visit, before parts
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Scope */}
          <section aria-labelledby="included-heading" className="mt-8">
            <h2
              id="included-heading"
              className="text-[19px] font-[650] text-ink sm:text-[21px]"
            >
              What this visit includes
            </h2>
            <ul className="mt-3 space-y-2.5 rounded-lg border border-line bg-surface p-5">
              {service.includedWork.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink-secondary">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                    <Check aria-hidden="true" className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Exclusions and additional charges */}
          <section aria-labelledby="exclusions-heading" className="mt-8">
            <h2
              id="exclusions-heading"
              className="text-[19px] font-[650] text-ink sm:text-[21px]"
            >
              Not included, and what can cost extra
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="text-[15px] font-semibold text-ink">
                  Outside this service
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {service.exclusions.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[14px] leading-relaxed text-ink-secondary"
                    >
                      <X
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-ink-muted"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-[#f3dcb4] bg-accent-subtle p-5">
                <h3 className="text-[15px] font-semibold text-ink">
                  Additional charges
                </h3>
                <ul className="mt-3 space-y-3">
                  {service.additionalCharges.map((charge) => (
                    <li key={charge.item}>
                      <p className="text-[14px] font-semibold text-ink">
                        {charge.item}
                      </p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-secondary">
                        {charge.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Notice tone="info" className="mt-3">
              Additional work is only started after you review a quote and
              approve it. Nothing on this page is billed automatically.
            </Notice>
          </section>

          {/* Policy grid */}
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <section
              aria-labelledby="cancellation-heading"
              className="rounded-lg border border-line bg-surface p-5"
            >
              <h2
                id="cancellation-heading"
                className="text-[15px] font-semibold text-ink"
              >
                Cancellation policy
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
                {service.cancellationPolicy}
              </p>
            </section>

            <section
              aria-labelledby="warranty-heading"
              className="rounded-lg border border-line bg-surface p-5"
            >
              <h2
                id="warranty-heading"
                className="flex items-center gap-2 text-[15px] font-semibold text-ink"
              >
                <ShieldCheck aria-hidden="true" className="size-4 text-success" />
                Warranty summary
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
                {service.warrantySummary}
              </p>
            </section>
          </div>
        </div>

        {/* Booking sidebar (desktop) */}
        <aside aria-label="Book this service" className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-line bg-surface p-5">
            <p className="text-[13px] font-medium text-ink-muted">
              Estimated cost
            </p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[13px] text-ink-muted">From</span>
              <span className="text-[26px] font-[680] text-ink">
                {formatINR(service.startPrice)}
              </span>
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              {formatDuration(service.durationMins)} estimated · taxes shown at
              review
            </p>

            <Link
              href={`/book/${service.slug}`}
              className={buttonStyles({ fullWidth: true, size: "lg" }) + " mt-4"}
            >
              Choose a time
            </Link>

            <ul className="mt-4 space-y-2.5 border-t border-line pt-4 text-[13.5px] text-ink-secondary">
              <li className="flex gap-2">
                <UserCheck aria-hidden="true" className="size-4 shrink-0 text-brand" />
                A technician is assigned from the demo team
              </li>
              <li className="flex gap-2">
                <ShieldCheck
                  aria-hidden="true"
                  className="size-4 shrink-0 text-brand"
                />
                30-day labour warranty
              </li>
              <li className="flex gap-2">
                <IndianRupee
                  aria-hidden="true"
                  className="size-4 shrink-0 text-brand"
                />
                Nothing is charged in this demo
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Reserve room for the fixed action bar so page content is never hidden */}
      <div aria-hidden="true" className="h-24 lg:hidden" />

      {/* Fixed primary action (mobile/tablet) — stays glued above the bottom nav */}
      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface/95 backdrop-blur md:bottom-0 md:pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8">
          <div className="min-w-0">
            <p className="text-[12px] leading-none text-ink-muted">From</p>
            <p className="mt-1 text-[17px] font-semibold leading-none text-ink">
              {formatINR(service.startPrice)}
            </p>
          </div>
          <Link
            href={`/book/${service.slug}`}
            className={buttonStyles({ size: "md" })}
          >
            Choose a time
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </Container>
  );
}
