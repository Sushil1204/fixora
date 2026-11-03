"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/** Bell with unread indicator. The count is also announced in the label. */
export function NotificationBell({ className }: { className?: string }) {
  const { unreadCount, hydrated } = useDemoStore();
  const hasUnread = hydrated && unreadCount > 0;

  return (
    <Link
      href="/notifications"
      aria-label={
        hasUnread
          ? `Notifications, ${unreadCount} unread`
          : "Notifications, none unread"
      }
      className={cn(
        "relative grid size-10 place-items-center rounded-md border border-line bg-surface text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
    >
      <Bell aria-hidden="true" className="size-[19px]" />
      {hasUnread ? (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-surface"
        />
      ) : null}
    </Link>
  );
}
