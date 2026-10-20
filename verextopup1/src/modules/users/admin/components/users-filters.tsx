"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";

export function UsersFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/admin/users?${next.toString()}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update("search", search.trim());
  };

  const hasFilters =
    params.get("search") ||
    (params.get("role") && params.get("role") !== "all") ||
    (params.get("status") && params.get("status") !== "all") ||
    (params.get("sort") && params.get("sort") !== "newest");

  return (
    <div className="bg-bg-card border border-border rounded-xl p-3 flex flex-wrap items-center gap-3">
      <form onSubmit={submitSearch} className="flex-1 min-w-[240px] relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Email, name, phone দিয়ে search করুন..."
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

      <select
        value={params.get("role") || "all"}
        onChange={(e) => update("role", e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
      >
        <option value="all">All Roles</option>
        <option value="CUSTOMER">Customer</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
      </select>

      <select
        value={params.get("status") || "all"}
        onChange={(e) => update("status", e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
      >
        <option value="all">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="BANNED">Banned</option>
        <option value="SUSPENDED">Suspended</option>
      </select>

      <select
        value={params.get("sort") || "newest"}
        onChange={(e) => update("sort", e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="name">Name (A-Z)</option>
        <option value="email">Email (A-Z)</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="px-3 py-2 rounded-lg border border-border text-text-muted hover:text-text-primary text-sm transition"
        >
          Clear
        </button>
      )}
    </div>
  );
}