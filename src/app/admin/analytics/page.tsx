import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import {
  getLiveUsers,
  getRevenueAnalytics,
  getRevenueChart,
  getOrderAnalytics,
  getTopProducts,
  getUserAnalytics,
  getWalletAnalytics,
  getProductAnalytics,
  getReviewAnalytics,
  getSupportAnalytics,
} from "@/modules/analytics/admin/queries";
import { AnalyticsFilters } from "@/modules/analytics/admin/components/analytics-filters";
import { LiveUsersWidget } from "@/modules/analytics/admin/components/live-users-widget";
import { RevenueSection } from "@/modules/analytics/admin/components/revenue-section";
import { RevenueChart } from "@/modules/analytics/admin/components/revenue-chart";
import { OrderAnalyticsSection } from "@/modules/analytics/admin/components/order-analytics-section";
import { UserGrowthChart } from "@/modules/analytics/admin/components/user-growth-chart";
import { WalletAnalyticsSection } from "@/modules/analytics/admin/components/wallet-analytics-section";
import { TopProductsList } from "@/modules/analytics/admin/components/top-products-list";
import { TopSpendersList } from "@/modules/analytics/admin/components/top-spenders-list";
import { ProductReviewSupportSection } from "@/modules/analytics/admin/components/product-review-support-section";

export const metadata: Metadata = {
  title: "Analytics — Admin",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const from = params.from;
  const to = params.to;

  const [
    live,
    revenue,
    revenueChart,
    orders,
    topProducts,
    users,
    wallet,
    products,
    reviews,
    support,
  ] = await Promise.all([
    getLiveUsers(),
    getRevenueAnalytics(from, to),
    getRevenueChart(from, to),
    getOrderAnalytics(from, to),
    getTopProducts(from, to),
    getUserAnalytics(from, to),
    getWalletAnalytics(from, to),
    getProductAnalytics(),
    getReviewAnalytics(from, to),
    getSupportAnalytics(from, to),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Complete business insights
          </p>
        </div>
      </div>

      {/* Live Users */}
      <LiveUsersWidget initial={live} />

      {/* Date filters */}
      <AnalyticsFilters />

      {/* Revenue */}
      <RevenueSection data={revenue} />
      <RevenueChart data={revenueChart} />

      {/* Orders */}
      <OrderAnalyticsSection data={orders} />

      {/* Users */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
          User Analytics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Users"
            value={users.totalUsers}
            color="primary"
          />
          <StatCard
            label="New (in period)"
            value={users.newUsers}
            color="success"
          />
          <StatCard
            label="Active (7d)"
            value={users.activeLastWeek}
            color="accent"
          />
          <StatCard
            label="Active (30d)"
            value={users.activeLastMonth}
            color="warning"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UserGrowthChart data={users.growthChart} />
          <TopSpendersList spenders={users.topSpenders} />
        </div>
      </div>

      {/* Wallet */}
      <WalletAnalyticsSection data={wallet} />

      {/* Products + Reviews + Support */}
      <ProductReviewSupportSection
        product={products}
        review={reviews}
        support={support}
      />

      {/* Top Products */}
      <TopProductsList products={topProducts} />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "primary" | "success" | "accent" | "warning";
}) {
  const colors = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
    warning: "text-warning",
  };
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</div>
    </div>
  );
}