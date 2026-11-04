import type { Metadata } from "next";
import { ProContainer } from "@/components/pro/tech-shell";
import { TechDashboard } from "@/components/pro/tech-dashboard";

export const metadata: Metadata = {
  title: "Technician jobs",
  description:
    "Today's assigned jobs, outstanding actions and settlement snapshot for the demo technician.",
};

export default function TechnicianDashboardPage() {
  return (
    <ProContainer>
      <TechDashboard />
    </ProContainer>
  );
}
