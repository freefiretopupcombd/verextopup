"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCheck,
  Bell,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Star,
  MessageSquare,
  Gift,
} from "lucide-react";
import { toast } from "sonner";

import {
  markAsReadAction,
  markAllAsReadAction,
  deleteNotificationAction,
} from "../actions";

// ✅ ICON_MAP এখন Client Component-এর ভিতরে
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Star,
  MessageSquare,
  Gift,
  Bell,
};

export function NotificationsList({
  notifications,
  hasUnread,
  page,
  totalPages,
}: {
  notifications: any[];
  hasUnread: boolean;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMarkAll = () => {
    startTransition(async () => {
      const result = await markAllAsReadAction();
      if (result.success) {
        toast.success("সব notification read করা হয়েছে");
        router.refresh();
      }
    });
  };

  const handleClick = (id: string, isRead: boolean, link: string | null) => {
    if (!isRead) {
      startTransition(async () => {
        await markAsReadAction(id);
      });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await deleteNotificationAction(id);
      if (result.success) {
        toast.success("Delete হয়েছে");
        router.refresh();
      }
    });
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-2">
          কোনো notification নেই
        </h2>
        <p className="text-sm text-text-muted">
          Order, payment, wallet update-এর notification এখানে দেখাবে
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mark all button */}
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="inline-flex items-center gap-2 text-xs text-primary hover:underline font-medium disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            সব read করুন
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="space-y-2">
        {notifications.map((n) => {
          // ✅ ICON_MAP এখান থেকে use হচ্ছে
          const IconComponent = ICON_MAP[n.icon] || Bell;
          const colorClasses: Record<string, string> = {
            primary: "bg-primary/10 text-primary",
            success: "bg-success/10 text-success",
            danger: "bg-danger/10 text-danger",
            warning: "bg-warning/10 text-warning",
            accent: "bg-accent/10 text-accent",
          };
          const iconColor = colorClasses[n.color] || colorClasses.primary;

          const content = (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border transition group relative ${
                n.isRead
                  ? "bg-bg-card border-border"
                  : "bg-primary/5 border-primary/30"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      n.isRead ? "text-text-primary" : "text-primary"
                    }`}
                  >
                    {n.title}
                  </h3>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>

                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {n.message}
                </p>

                <div className="text-[10px] text-text-muted mt-2">
                  {new Date(n.createdAt).toLocaleString("en-GB")}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, n.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition shrink-0"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );

          if (n.link) {
            return (
              <Link
                key={n.id}
                href={n.link}
                onClick={() => handleClick(n.id, n.isRead, n.link)}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={n.id}
              onClick={() => handleClick(n.id, n.isRead, null)}
              className="cursor-pointer"
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === page;
            return (
              <Link
                key={p}
                href={`/account/notifications?page=${p}`}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition flex items-center justify-center ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-bg-card text-text-secondary hover:border-primary"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}