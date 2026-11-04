import type { Metadata } from "next";
import { Suspense } from "react";
import { TechniciansView } from "@/components/admin/technicians-view";
import { AdminPageSkeleton } from "@/components/admin/admin-ui";

export const metadata: Metadata = {
  title: "Technicians · Fixora operations demo",
};

export default function AdminTechniciansPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton cards={3} />}>
      <TechniciansView />
    </Suspense>
  );
}
