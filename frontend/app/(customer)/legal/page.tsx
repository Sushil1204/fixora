import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = {
  title: "Legal & policies",
  description:
    "Demo terms, privacy notes and cancellation policy for the Fixora concept.",
};

const sections = [
  {
    id: "terms",
    title: "Terms of the demo",
    body: [
      "Fixora is a product demonstration. Services, technicians, prices, estimates and bookings are fictional examples created to show an interface.",
      "Nothing on this site forms a contract for repair work, and no real service is dispatched. Do not enter personal, financial or identity information.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy note",
    body: [
      "The demo has no backend. Profile details, addresses, bookings and notification read states are stored in your browser's local storage on this device only.",
      "Clearing site data, using a private window or pressing “Reset demo data” in your profile removes this information.",
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation policy (demo terms)",
    body: [
      "Free cancellation up to four hours before a visit. After a technician is assigned, a ₹99 cancellation fee applies in the example terms; no amount is ever charged in this demo.",
      "Rescheduling is free until the technician is on the way. Once a visit is in progress, changes go through support.",
    ],
  },
  {
    id: "estimates",
    title: "Estimates and additional work",
    body: [
      "Every booking shows a line-item estimate with a service charge, convenience fee and tax line. The estimated total is not a final invoice.",
      "Additional parts or work outside the listed scope are quoted separately and only start after the customer approves the quote.",
    ],
  },
];

export default function LegalPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader
        title="Legal & policies"
        description="How this demonstration works, what it stores, and the example policy terms used in the interface."
        className="mb-5"
      />

      <Notice tone="info" title="Illustrative content">
        These policies describe the demo experience only. They are not legal terms
        for a live service.
      </Notice>

      <nav aria-label="On this page" className="mt-5">
        <ul className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="inline-block rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 space-y-4">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-24 rounded-lg border border-line bg-surface p-5"
          >
            <h2
              id={`${section.id}-heading`}
              className="text-[17px] font-semibold text-ink"
            >
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-2 text-[14.5px] leading-relaxed text-ink-secondary"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-6 text-[14px] text-ink-muted">
        Questions about the demo?{" "}
        <Link
          href="/support"
          className="font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Raise a simulated support case
        </Link>
        .
      </p>
    </Container>
  );
}
