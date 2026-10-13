import type { Metadata } from "next";
import Link from "next/link";
import { Bell, BellOff, Clock, FileText } from "lucide-react";

import {
  listNotificationsAdmin,
  getNotificationStats,
} from "@/modules/notifications/queries";
import { NotificationsTable } from "@/modules/notifications/admin/components/notifications-table";
import { Pagination } from "@/modules/products/components/pagination";

export const metadata: Metadata = {
  title: "Notifications — Admin",
};

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "ORDER_PLACED", label: "Orders" },
  { value: "PAYMENT_VERIFIED", label: "Payments" },
  { value: "WALLET_CREDITED", label: "Wallet" },
  { value: "TOPUP_APPROVED", label: "Top-Ups" },
  { value: "TICKET_REPLY", label: "Support" },
];

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const type = params.type || "all";
  const page = Math.max(1, parseInt(params.page || "1"));

  const [data, stats] = await Promise.all([
    listNotificationsAdmin({ type, page, perPage: 20 }),
    getNotificationStats(),
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Notifications
          </h1>
          <p className="text-text-muted text-sm mt-1">
            সব user notification log
          </p>
        </div>
        <Link
          href="/admin/notifications/templates"
          className="inline-flex items-center gap-2 bg-bg-card border border-border hover:border-primary text-text-primary font-medium px-4 py-2.5 rounded-lg transition"
        >
          <FileText className="w-4 h-4" />
          Templates
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Bell}
          label="Total"
          value={stats.total.toString()}
          color="primary"
        />
        <StatCard
          icon={BellOff}
          label="Unread"
          value={stats.unread.toString()}
          color="warning"
        />
        <StatCard
          icon={Clock}
          label="Today"
          value={stats.today.toString()}
          color="accent"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TYPE_FILTERS.map((f) => {
          const active = type === f.value;
          return (
            <Link
              key={f.value}
              href={
                f.value === "all"
                  ? "/admin/notifications"
                  : `/admin/notifications?type=${f.value}`
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                active
                  ? "bg-primary text-white"
                  : "bg-bg-card border border-border text-text-secondary hover:border-border-light"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="text-xs text-text-muted">
        {data.total} টা notification
      </div>

      <NotificationsTable notifications={data.notifications} />

      {data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: "primary" | "warning" | "accent";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div
        className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className="text-lg font-bold text-text-primary mt-0.5">
        {value}
      </div>
    </div>
  );
}