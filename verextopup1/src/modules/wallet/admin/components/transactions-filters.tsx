"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Download, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { REASON_LABELS } from "../validations";

export function TransactionsFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [isPending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/admin/wallets/transactions?${next.toString()}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update("search", search.trim());
  };

  const handleExport = () => {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/wallets/transactions/export?${params.toString()}`
        );
        if (!res.ok) throw new Error("Export failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("CSV downloaded");
      } catch (e) {
        toast.error("Export failed");
      }
    });
  };

  // Reasons from validations
  const reasons = Object.entries(REASON_LABELS);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form onSubmit={submitSearch} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Reference, email, note দিয়ে search..."
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                update("search", "");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-card text-text-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Export */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isPending}
          className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Type */}
        <select
          value={params.get("type") || "all"}
          onChange={(e) => update("type", e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Types</option>
          <option value="CREDIT">Credit</option>
          <option value="DEBIT">Debit</option>
        </select>

        {/* Reason */}
        <select
          value={params.get("reason") || "all"}
          onChange={(e) => update("reason", e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Reasons</option>
          {reasons.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={params.get("dateFrom") || ""}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
          placeholder="From"
        />

        {/* Date To */}
        <input
          type="date"
          value={params.get("dateTo") || ""}
          onChange={(e) => update("dateTo", e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
          placeholder="To"
        />

        {/* Clear */}
        {(params.get("type") ||
          params.get("reason") ||
          params.get("dateFrom") ||
          params.get("dateTo")) && (
          <button
            type="button"
            onClick={() => router.push("/admin/wallets/transactions")}
            className="px-3 py-2 rounded-lg border border-border text-text-muted hover:text-text-primary text-sm transition"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}