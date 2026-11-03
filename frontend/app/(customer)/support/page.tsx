import type { Metadata } from "next";
import { Container } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SupportForm } from "@/components/support/support-form";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Raise a simulated support case linked to one of your demo bookings.",
};

interface SupportPageProps {
  searchParams: Promise<{ booking?: string }>;
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const { booking } = await searchParams;

  return (
    <Container className="max-w-3xl">
      <PageHeader
        title="Help & support"
        description="Tell us what went wrong and which booking it relates to. Cases are simulated in this demo."
        className="mb-6"
      />
      <SupportForm initialBooking={booking} />
    </Container>
  );
}
