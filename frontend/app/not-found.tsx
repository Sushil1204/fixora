import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
          <Compass aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-4 text-[22px] font-semibold text-ink">
          That page isn&apos;t here
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
          The link may be out of date, or the service or booking it pointed to
          isn&apos;t part of the demo data.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className={buttonStyles({ size: "md" })}>
            Go to home
          </Link>
          <Link
            href="/services"
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            Browse services
          </Link>
        </div>
      </div>
    </div>
  );
}
