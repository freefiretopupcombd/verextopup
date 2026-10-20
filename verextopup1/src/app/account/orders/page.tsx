import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Wallet, Package, ChevronRight } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import {
  listCustomerHistory,
  getCustomerStats,
} from "@/modules/orders/queries";
import { DualPrice } from "@/modules/currency/components/dual-price";

export const metadata: Metadata = {
  title: "My Orders — VerexTopUp",
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "PENDING_PAYMENT", label: "Pending" },
  { value: "AWAITING_VERIFICATION", label: "Under Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

const TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "product", label: "Product Orders" },
  { value: "topup", label: "Wallet Top-Ups" },
];

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const status = params.status || "all";
  const type = (params.type as any) || "all";

  const [data, stats] = await Promise.all([
    listCustomerHistory({ userId, type, status, page, perPage: 20 }),
    getCustomerStats(userId),
  ]);

  const buildFilterHref = (key: string, value: string) => {
    const newParams = new URLSearchParams(params);
    if (value === "all") newParams.delete(key);
    else newParams.set(key, value);
    newParams.delete("page");
    return `/account/orders?${newParams.toString()}`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          আমার Orders
        </h1>
        <p className="text-sm text-text-muted mt-1">
          সব product orders এবং wallet top-ups
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ShoppingBag}
          label="Total"
          value={stats.totalHistory.toString()}
          color="primary"
        />
        <StatCard
          icon={Package}
          label="Product Orders"
          value={stats.totalOrders.toString()}
          color="accent"
        />
        <StatCard
          icon={Wallet}
          label="Wallet Top-Ups"
          value={stats.totalTopUps.toString()}
          color="success"
        />
        <StatCard
          icon={ShoppingBag}
          label="Completed"
          value={(stats.completedOrders + stats.approvedTopUps).toString()}
          color="success"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TYPE_FILTERS.map((f) => {
          const active = type === f.value;
          return (
            <Link
              key={f.value}
              href={buildFilterHref("type", f.value)}
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

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <Link
              key={f.value}
              href={buildFilterHref("status", f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                active
                  ? "bg-primary/15 text-primary"
                  : "bg-bg-card border border-border text-text-muted hover:border-border-light"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Count */}
      <div className="text-xs text-text-muted">
        {data.total} টা entry
      </div>

      {/* List */}
      {data.items.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            কোনো order নেই
          </h2>
          <p className="text-sm text-text-muted mb-6">
            এখনো কোনো order বা top-up করা হয়নি
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            Products দেখুন
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => {
            const isTopUp = item.type === "WALLET_TOPUP";
            const isPaid = item.paymentStatus === "PAID";

            return (
              <Link
                key={item.id}
                href={
                  isTopUp
                    ? `/account/wallet/topups/${item.id}`
                    : `/order/${item.referenceNumber}`
                }
                className="block bg-bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition group"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isTopUp
                        ? "bg-accent/15 text-accent"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {isTopUp ? (
                      <Wallet className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold text-primary truncate">
                          {item.referenceNumber}
                        </div>
                        <div
                          className={`text-[10px] font-semibold mt-0.5 ${
                            isTopUp ? "text-accent" : "text-text-muted"
                          }`}
                        >
                          {isTopUp ? "Wallet Top-Up" : "Product Order"}
                        </div>
                      </div>
                      <DualPrice
                        amountBDT={item.amount}
                        size="sm"
                        layout="stacked"
                        primaryClassName="text-text-primary shrink-0"
                      />
                    </div>

                    {item.productInfo && (
                      <div className="text-xs text-text-secondary truncate mt-1">
                        {item.productInfo.productName} —{" "}
                        {item.productInfo.variantName}
                      </div>
                    )}

                    {isTopUp && (
                      <div className="text-xs text-text-muted mt-1">
                        Recharge amount
                      </div>
                    )}

                    {/* Bottom row */}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            item.status === "COMPLETED"
                              ? "bg-success/15 text-success"
                              : item.status === "AWAITING_VERIFICATION"
                                ? "bg-warning/15 text-warning"
                                : item.status === "PENDING_PAYMENT"
                                  ? "bg-warning/15 text-warning"
                                  : item.status === "FAILED"
                                    ? "bg-danger/15 text-danger"
                                    : "bg-text-muted/15 text-text-muted"
                          }`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isPaid
                              ? "bg-success/15 text-success"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          {isPaid ? "PAID" : item.paymentStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-text-muted group-hover:text-primary transition">
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {Array.from({ length: data.totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === data.page;
            const newParams = new URLSearchParams(params);
            if (p === 1) newParams.delete("page");
            else newParams.set("page", String(p));

            return (
              <Link
                key={p}
                href={`/account/orders?${newParams.toString()}`}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition flex items-center justify-center ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-bg-card text-text-secondary hover:border-primary hover:text-primary"
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

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: "primary" | "accent" | "success";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div
        className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}
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