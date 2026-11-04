import type { Metadata } from "next";
import { ServicesView } from "@/components/admin/services-view";

export const metadata: Metadata = {
  title: "Service catalogue · Fixora operations demo",
};

export default function AdminServicesPage() {
  return <ServicesView />;
}
