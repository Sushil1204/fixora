import type { Metadata } from "next";
import { Container } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Booking updates, estimate approvals and demo messages.",
};

export default function NotificationsPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Booking updates and approval requests. Opening one marks it as read."
        className="mb-6"
      />
      <NotificationsView />
    </Container>
  );
}
