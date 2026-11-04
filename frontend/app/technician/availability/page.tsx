import type { Metadata } from "next";
import { ProContainer } from "@/components/pro/tech-shell";
import { AvailabilityView } from "@/components/pro/availability-view";

export const metadata: Metadata = {
  title: "Availability",
  description:
    "Set online status, working days and service coverage for the demo technician.",
};

export default function TechnicianAvailabilityPage() {
  return (
    <ProContainer>
      <AvailabilityView />
    </ProContainer>
  );
}
