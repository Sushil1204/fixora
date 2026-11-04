import type { Metadata } from "next";
import { Suspense } from "react";
import { DisputesView } from "@/components/admin/disputes-view";
import { AdminPageSkeleton } from "@/components/admin/admin-ui";

export const metadata: Metadata = {
  title: "Disputes · Fixora operations demo",
};

export default function AdminDisputesPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton cards={3} />}>
      <DisputesView />
    </Suspense>
  );
}
