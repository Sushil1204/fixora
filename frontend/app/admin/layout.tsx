import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * The operations shell derives the page title, alert counts and reporting
 * selector from the pathname and demo store, so render it per request.
 */
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
