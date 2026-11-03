import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Container } from "@/components/shell/app-shell";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline",
  description: "This page is not available offline yet.",
  robots: { index: false },
};

/**
 * Served by the service worker when a navigation fails and the requested page
 * was never cached. Static, so it is precached with the app shell.
 */
export default function OfflinePage() {
  return (
    <Container>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-line bg-surface px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
          <WifiOff aria-hidden="true" className="size-6" />
        </span>
        <h1 className="text-[22px] font-semibold text-ink">
          You&apos;re offline
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          This page hasn&apos;t been opened on this device yet. Pages you have
          already visited still work, and everything returns when you
          reconnect.
        </p>
        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
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
    </Container>
  );
}
