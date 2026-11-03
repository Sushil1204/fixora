import type { ReactNode } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";

/**
 * Shared customer shell: sticky header, content region, fixed mobile bottom nav.
 * Bottom padding reserves space for the nav so nothing is ever covered.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main
        id="main-content"
        className="flex-1 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+1.5rem)] md:pb-0"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

/**
 * Standard page container: mobile-first padding, generous desktop breathing
 * room. `bottomless` removes the bottom pad for pages that end in a sticky
 * action bar, without relying on utility-order overrides.
 */
export function Container({
  children,
  className,
  bottomless,
}: {
  children: ReactNode;
  className?: string;
  bottomless?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 lg:pt-10 ${
        bottomless ? "pb-0" : "pb-6 sm:pb-8 lg:pb-10"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
