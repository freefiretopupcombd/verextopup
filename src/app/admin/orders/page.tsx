import type { Metadata } from "next";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  Wallet,
  Package,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  listUnifiedOrders,
  getUnifiedStats,
  getProfitStats,
} from "@/modules/orders/admin/queries";
import { OrderFilters } from "@/modules/orders/admin/components/order-filters";
import { OrderTable } from "@/modules/orders/admin/components/order-table";
import { Pagination } from "@/modules/products/components/pagination";

export const metadata: Metadata = {
  title: "Orders & Top-Ups — Admin",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const sort = (params.sort as any) || "newest";
  const type = (params.type as any) || "all";

  const [data, stats, profitStats, paymentMethods] = await Promise.all([
    listUnifiedOrders({
      status: params.status,
      paymentStatus: params.paymentStatus,
      paymentMethodId: params.paymentMethodId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      search: params.search,
      type,
      sort,
      page,
      perPage: 20,
    }),
    getUnifiedStats(),
    getProfitStats(),
    prisma.paymentMethod.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Orders & Wallet Top-Ups
        </h1>
        <p className="text-text-muted text-sm mt-1">
          সব order এবং recharge requests এক জায়গায়
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders.toString()}
          color="primary"
          subtitle={`${stats.totalProductOrders} product + ${stats.totalTopUps} top-up`}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingOrders.toString()}
          color="warning"
          subtitle={`${stats.pendingProductOrders} + ${stats.pendingTopUps}`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completedOrders.toString()}
          color="success"
          subtitle={`${stats.completedProductOrders} + ${stats.approvedTopUps}`}
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          color="accent"
          subtitle="Product + Top-Up"
        />
      </div>

      {/* Revenue breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SmallStatCard
          icon={Package}
          label="Product Revenue"
          value={`৳${stats.productRevenue.toFixed(2)}`}
          color="primary"
        />
        <SmallStatCard
          icon={Wallet}
          label="Top-Up Revenue"
          value={`৳${stats.topUpRevenue.toFixed(2)}`}
          color="accent"
        />
        <SmallStatCard
          icon={TrendingUp}
          label="Today's Total"
          value={`৳${stats.todayRevenue.toFixed(2)}`}
          color="success"
        />
        <SmallStatCard
          icon={Calendar}
          label="This Month"
          value={`৳${stats.monthRevenue.toFixed(2)}`}
          color="warning"
        />
      </div>

      {/* Profit Stats (Product Only) */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-text-primary">
            Profit (Product Orders Only)
          </h3>
          <span className="text-[10px] text-text-muted">
            Wallet top-ups-এ profit নেই
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Total Profit
            </div>
            <div className="text-base font-bold text-success mt-0.5">
              ৳{profitStats.totalProfit.toFixed(2)}
            </div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Today
            </div>
            <div className="text-base font-bold text-text-primary mt-0.5">
              ৳{profitStats.todayProfit.toFixed(2)}
            </div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              This Month
            </div>
            <div className="text-base font-bold text-text-primary mt-0.5">
              ৳{profitStats.monthProfit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <TypeChip
          label="All"
          value="all"
          currentValue={type}
          count={stats.totalOrders}
          searchParams={params}
        />
        <TypeChip
          label="Product Orders"
          value="product"
          currentValue={type}
          count={stats.totalProductOrders}
          searchParams={params}
        />
        <TypeChip
          label="Wallet Top-Ups"
          value="topup"
          currentValue={type}
          count={stats.totalTopUps}
          searchParams={params}
        />
      </div>

      {/* Filters */}
      <OrderFilters paymentMethods={paymentMethods} />

      {/* Count */}
      <div className="text-xs text-text-muted">
        {data.total} টা entry found
      </div>

      {/* Table */}
      <OrderTable orders={data.orders} />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}

function TypeChip({
  label,
  value,
  currentValue,
  count,
  searchParams,
}: {
  label: string;
  value: string;
  currentValue: string;
  count: number;
  searchParams: Record<string, string>;
}) {
  const active = currentValue === value;

  const params = new URLSearchParams(searchParams);
  if (value === "all") {
    params.delete("type");
  } else {
    params.set("type", value);
  }
  params.delete("page");

  return (
    <a
      href={`/admin/orders?${params.toString()}`}
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
        active
          ? "bg-primary text-white"
          : "bg-bg-card border border-border text-text-secondary hover:border-border-light"
      }`}
    >
      {label}
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
          active ? "bg-white/20 text-white" : "bg-bg-secondary text-text-muted"
        }`}
      >
        {count}
      </span>
    </a>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
}: {
  icon: any;
  label: string;
  value: string;
  color: "primary" | "warning" | "success" | "accent";
  subtitle?: string;
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
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
      <div className="text-lg sm:text-xl font-bold text-text-primary mt-0.5">
        {value}
      </div>
      {subtitle && (
        <div className="text-[10px] text-text-muted mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}

function SmallStatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: any;
  label: string;
  value: string;
  color?: "primary" | "warning" | "success" | "accent";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          {label}
        </div>
        <div className="text-sm font-bold text-text-primary mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}