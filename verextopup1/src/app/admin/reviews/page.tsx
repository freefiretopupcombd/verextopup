import type { Metadata } from "next";
import Link from "next/link";
import { Star, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

import { listReviewsAdmin, getReviewStats } from "@/modules/reviews/queries";
import { ReviewTable } from "@/modules/reviews/admin/components/review-table";

export const metadata: Metadata = {
  title: "Reviews — Admin",
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIDDEN", label: "Hidden" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const status = params.status || "all";

  const [data, stats] = await Promise.all([
    listReviewsAdmin({ status, page, perPage: 20 }),
    getReviewStats(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reviews</h1>
        <p className="text-text-muted text-sm mt-1">
          Customer reviews approve/reject করুন
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Star}
          label="Total Reviews"
          value={stats.total.toString()}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending.toString()}
          color="warning"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved.toString()}
          color="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          color="accent"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <Link
              key={f.value}
              href={
                f.value === "all"
                  ? "/admin/reviews"
                  : `/admin/reviews?status=${f.value}`
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
        {data.total} টা review
      </div>

      <ReviewTable reviews={data.reviews} />

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: data.totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === data.page;
            const newParams = new URLSearchParams(params);
            if (p === 1) newParams.delete("page");
            else newParams.set("page", String(p));

            return (
              <Link
                key={p}
                href={`/admin/reviews?${newParams.toString()}`}
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
  color: "primary" | "warning" | "success" | "accent";
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
    </div>
  );
}