import type { Metadata } from "next";
import { Container } from "@/components/shell/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Contact summary, saved addresses, profile edits and demo account controls.",
};

export default function ProfilePage() {
  return (
    <Container>
      <PageHeader
        title="Profile"
        description="Your contact details, saved addresses and account links. Everything here is demo data stored in this browser."
        className="mb-6"
      />
      <ProfileView />
    </Container>
  );
}
