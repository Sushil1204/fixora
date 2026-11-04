import type { Metadata } from "next";
import { ProContainer } from "@/components/pro/tech-shell";
import { JobDetail } from "@/components/pro/job-detail";

interface JobDetailPageProps {
  params: Promise<{ jobId: string }>;
}

export const metadata: Metadata = {
  title: "Job details",
  description:
    "Schedule, customer notes, checklist, photo evidence and extra-work quote for one assigned job.",
};

export default async function TechnicianJobPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;

  return (
    <ProContainer>
      <JobDetail jobId={jobId} />
    </ProContainer>
  );
}
