import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingsView } from "@/components/admin/bookings-view";
import { AdminPageSkeleton } from "@/components/admin/admin-ui";

export const metadata: Metadata = {
  title: "Bookings · Fixora operations demo",
};

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton cards={3} />}>
      <BookingsView />
    </Suspense>
  );
}
