import type { Metadata } from "next";
import { Container } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { ServiceCatalog } from "@/components/services/service-catalog";
import { SERVICE_CATEGORIES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse home-repair services with starting prices, estimated duration and clear scope.",
};

interface ServicesPageProps {
  searchParams: Promise<{ q?: string; category?: string; demoState?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { q, category, demoState } = await searchParams;
  const validCategory = SERVICE_CATEGORIES.some((c) => c.id === category)
    ? category
    : undefined;

  return (
    <Container>
      <PageHeader
        title="Services"
        description="Every service lists its starting price, estimated duration and what is included. Estimates are confirmed before work begins."
      />

      <div className="mt-6">
        <ServiceCatalog
          initialQuery={q ?? ""}
          initialCategory={validCategory}
          initialError={demoState === "error"}
        />
      </div>
    </Container>
  );
}
