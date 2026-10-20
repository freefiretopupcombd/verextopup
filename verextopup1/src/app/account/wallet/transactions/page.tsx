import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getWalletTransactions } from "@/modules/wallet/queries";

export const metadata: Metadata = {
  title: "Wallet Transactions — VerexTopUp",
};

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "CREDIT", label: "Credits" },
  { value: "DEBIT", label: "Debits" },
];

export default async function WalletTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const type = (params.type as any) || "all";

  const data = await getWalletTransactions(userId, page, 20, type);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/account/wallet"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Wallet-এ ফিরুন
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Transaction History
        </h1>
        <p className="text-sm text-text-muted mt-1">
          সব wallet লেনদেন
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {TYPE_FILTERS.map((f) => {
          const active = type === f.value;
          const href =
            f.value === "all"
              ? "/account/wallet/transactions"
              : `/account/wallet/transactions?type=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
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
        {data.total} টা transaction
      </div>

      {/* List */}
      {data.transactions.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-text-muted text-sm">
            কোনো transaction নেই
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.transactions.map((t) => {
            const isCredit = t.type === "CREDIT";
            return (
              <div
                key={t.id}
                className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isCredit
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {isCredit ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary capitalize">
                    {t.reason.toLowerCase().replace(/_/g, " ")}
                  </div>
                  {t.reference && (
                    <div className="text-[10px] font-mono text-primary mt-0.5 truncate">
                      {t.reference}
                    </div>
                  )}
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {new Date(t.createdAt).toLocaleString("en-GB")}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold ${
                      isCredit ? "text-success" : "text-warning"
                    }`}
                  >
                    {isCredit ? "+" : "−"}৳{t.amount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    ৳{t.balanceAfter.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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
                href={`/account/wallet/transactions?${newParams.toString()}`}
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