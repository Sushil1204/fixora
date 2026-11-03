import { AppShell } from "@/components/shell/app-shell";

/**
 * The shell reads the current pathname (client hook) to mark the active tab,
 * so this segment is allowed to block rather than prerendering a nav without
 * an active state. Interactive customer routes are rendered per request.
 */
export const instant = false;

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
