import type { Metadata } from "next";
import Link from "next/link";
import { Settings } from "lucide-react";   // ← শুধু Settings লাগবে এখানে

import { auth } from "@/lib/auth/auth";
import { getUserNotifications } from "@/modules/notifications/queries";
import { NotificationsList } from "@/modules/notifications/components/notifications-list";

export const metadata: Metadata = {
  title: "Notifications — VerexTopUp",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const filter = (params.filter as any) || "all";

  const data = await getUserNotifications(userId, page, 20, filter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Notifications
          </h1>
          <p className="text-sm text-text-muted mt-1">
            আপনার সব notification
          </p>
        </div>

        <Link
          href="/account/notifications/preferences"
          className="inline-flex items-center gap-2 bg-bg-card border border-border hover:border-primary text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Settings className="w-4 h-4" />
          Preferences
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Link
          href="/account/notifications"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-bg-card border border-border text-text-secondary hover:border-border-light"
          }`}
        >
          All ({data.total})
        </Link>
        <Link
          href="/account/notifications?filter=unread"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            filter === "unread"
              ? "bg-primary text-white"
              : "bg-bg-card border border-border text-text-secondary hover:border-border-light"
          }`}
        >
          Unread
          {data.unreadCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === "unread"
                  ? "bg-white/20 text-white"
                  : "bg-error text-white"
              }`}
            >
              {data.unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* iconMap pass করা বন্ধ — শুধু notifications, hasUnread, page, totalPages */}
      <NotificationsList
        notifications={data.notifications}
        hasUnread={data.unreadCount > 0}
        page={data.page}
        totalPages={data.totalPages}
      />
    </div>
  );
}