import type { ReactNode } from "react";
import { TechShell } from "@/components/pro/tech-shell";

/**
 * The technician shell marks the active tab from the pathname, so this segment
 * renders per request rather than prerendering a nav without an active state.
 */
export const instant = false;

export default function TechnicianLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <TechShell>{children}</TechShell>;
}
