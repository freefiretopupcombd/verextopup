"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";

const orderStatuses = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING_PAYMENT", label: "Pending Payment" },
  { value: "AWAITING_VERIFICATION", label: "Awaiting Verification" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const paymentStatuses = [
  { value: "all", label: "All Payments" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount-high", label: "Amount: High → Low" },
  { value: "amount-low", label: "Amount: Low → High" },
];

export function OrderFilters({
  paymentMethods,
}: {
  paymentMethods: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const status = searchParams.get("status") || "all";
  const paymentStatus = searchParams.get("paymentStatus") || "all";
  const paymentMethodId = searchParams.get("paymentMethodId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const sort = searchParams.get("sort") || "newest";

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasFilters =
    status !== "all" ||
    paymentStatus !== "all" ||
    paymentMethodId ||
    dateFrom ||
    dateTo ||
    search;

  // Quick date presets
  const setQuickDate = (days: number | "today" | "month") => {
    const today = new Date();
    let from: Date;
    let to = today;

    if (days === "today") {
      from = new Date(today.setHours(0, 0, 0, 0));
      to = new Date();
    } else if (days === "month") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date();
    } else {
      from = new Date();
      from.setDate(from.getDate() - days);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("dateFrom", from.toISOString().split("T")[0]);
    params.set("dateTo", to.toISOString().split("T")[0]);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 sm:p-4 space-y-3">
      {/* Search + Sort + Toggle */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order number, customer email..."
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-bg-input border border-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="appearance-none bg-bg-secondary border border-border hover:border-border-light rounded-lg pl-3 pr-9 py-2 text-xs font-medium text-text-primary focus:outline-none focus:border-primary transition cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
            showAdvanced
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-danger/30 bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Quick date buttons */}
      <div className="flex gap-2 flex-wrap text-xs">
        <span className="text-text-muted self-center">Quick:</span>
        <button
          type="button"
          onClick={() => setQuickDate("today")}
          className="px-2.5 py-1 rounded-md bg-bg-secondary border border-border hover:border-primary text-text-secondary hover:text-primary transition"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(7)}
          className="px-2.5 py-1 rounded-md bg-bg-secondary border border-border hover:border-primary text-text-secondary hover:text-primary transition"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(30)}
          className="px-2.5 py-1 rounded-md bg-bg-secondary border border-border hover:border-primary text-text-secondary hover:text-primary transition"
        >
          Last 30 days
        </button>
        <button
          type="button"
          onClick={() => setQuickDate("month")}
          className="px-2.5 py-1 rounded-md bg-bg-secondary border border-border hover:border-primary text-text-secondary hover:text-primary transition"
        >
          This month
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-3 border-t border-border">
          <div>
            <label className="block text-[10px] font-medium text-text-muted mb-1">
              Order Status
            </label>
            <select
              value={status}
              onChange={(e) => updateParam("status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
            >
              {orderStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-text-muted mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => updateParam("paymentStatus", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
            >
              {paymentStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-text-muted mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethodId}
              onChange={(e) => updateParam("paymentMethodId", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="">All Methods</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-text-muted mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateParam("dateFrom", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-text-muted mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateParam("dateTo", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}