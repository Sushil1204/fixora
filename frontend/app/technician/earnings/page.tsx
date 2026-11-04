import type { Metadata } from "next";
import { ProContainer } from "@/components/pro/tech-shell";
import { EarningsView } from "@/components/pro/earnings-view";

export const metadata: Metadata = {
  title: "Earnings",
  description:
    "Illustrative payout breakdown, commission and settlement status for completed demo jobs.",
};

export default function TechnicianEarningsPage() {
  return (
    <ProContainer>
      <EarningsView />
    </ProContainer>
  );
}
