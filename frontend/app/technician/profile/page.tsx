import type { Metadata } from "next";
import { ProContainer } from "@/components/pro/tech-shell";
import { TechProfile } from "@/components/pro/tech-profile";

export const metadata: Metadata = {
  title: "Technician profile",
  description:
    "Skills, service coverage, demo verification and availability for the technician account.",
};

export default function TechnicianProfilePage() {
  return (
    <ProContainer>
      <TechProfile />
    </ProContainer>
  );
}
