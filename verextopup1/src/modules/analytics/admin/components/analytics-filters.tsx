"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

const PRESETS = [
  { label: "Today", days: 1 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "This Year", days: 365 },
];

export function AnalyticsFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const next = new URLSearchParams();
    next.set("from", start.toISOString().slice(0, 10));
    next.set("to", end.toISOString().slice(0, 10));
    router.push(`/admin/analytics?${next.toString()}`);
  };

  const setCustom = (key: "from" | "to", value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/analytics?${next.toString()}`);
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 mr-2">
        <Calendar className="w-4 h-4 text-text-muted" />
        <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
          Range
        </span>
      </div>

      {PRESETS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => setPreset(p.days)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-secondary text-text-secondary hover:bg-primary/10 hover:text-primary transition"
        >
          {p.label}
        </button>
      ))}

      <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

      <input
        type="date"
        value={from}
        onChange={(e) => setCustom("from", e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg-secondary text-text-primary text-xs focus:outline-none focus:border-primary"
      />
      <span className="text-text-muted text-xs">→</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setCustom("to", e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg-secondary text-text-primary text-xs focus:outline-none focus:border-primary"
      />
    </div>
  );
}