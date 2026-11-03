"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellOff, CalendarCheck, Info, ReceiptText } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { formatTimestamp } from "@/lib/format";
import type { AppNotification } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

const kindIcon = {
  booking: CalendarCheck,
  estimate: ReceiptText,
  system: Info,
} as const;

export function NotificationsView() {
  const {
    notifications,
    hydrated,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDemoStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!hydrated || loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2 h-3.5 w-2/3" />
            <Skeleton className="mt-3 h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={BellOff}
        title="No notifications"
        description="Booking updates, estimate approvals and demo system messages will appear here."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-ink-muted" aria-live="polite">
          {unreadCount === 0
            ? "You're all caught up."
            : `${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}`}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={markAllNotificationsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      <ul className="mt-4 space-y-2.5">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <NotificationRow
              notification={notification}
              onRead={() => markNotificationRead(notification.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: () => void;
}) {
  const Icon = kindIcon[notification.kind];
  const unread = !notification.read;

  const body = (
    <>
      <span
        className={cn(
          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-md",
          unread ? "bg-brand text-white" : "bg-brand-soft text-brand",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={cn(
              "text-[14.5px] leading-snug",
              unread ? "font-semibold text-ink" : "font-medium text-ink-secondary",
            )}
          >
            {notification.title}
          </span>
          {unread ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              Unread
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-[13.5px] leading-relaxed text-ink-muted">
          {notification.body}
        </span>
        <span className="mt-1.5 block text-[12px] tabular-nums text-ink-muted">
          {formatTimestamp(notification.createdAt)}
        </span>
      </span>
    </>
  );

  const className = cn(
    "flex w-full gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    unread
      ? "border-brand/25 bg-brand-subtle hover:border-brand/40"
      : "border-line bg-surface hover:border-line-strong",
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        onClick={onRead}
        aria-label={`${notification.title}${unread ? " (unread)" : ""}`}
        className={className}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onRead}
      aria-label={`${notification.title}${unread ? " (unread)" : ""}`}
      className={className}
    >
      {body}
    </button>
  );
}

