import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wallet, ChevronRight } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getWalletTopUps } from "@/modules/wallet/queries";
import { DualPrice } from "@/modules/currency/components/dual-price";

export const metadata: Metadata = {
  title: "Top-Up History — VerexTopUp",
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "AWAITING_VERIFICATION", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default async function TopUpsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const status = params.status || "all";

  const data = await getWalletTopUps(userId, page, 20, status);

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
          Top-Up History
        </h1>
        <p className="text-sm text-text-muted mt-1">
          সব wallet recharge requests
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          const href =
            f.value === "all"
              ? "/account/wallet/topups"
              : `/account/wallet/topups?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
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

      <div className="text-xs text-text-muted">
        {data.total} টা top-up
      </div>

      {data.topUps.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <p className="text-text-muted text-sm mb-4">
            কোনো top-up নেই
          </p>
          <Link
            href="/account/wallet/recharge"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            Recharge করুন
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {data.topUps.map((t) => (
            <Link
              key={t.id}
              href={`/account/wallet/topups/${t.id}`}
              className="block bg-bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    t.status === "APPROVED"
                      ? "bg-success/15 text-success"
                      : t.status === "REJECTED"
                        ? "bg-danger/15 text-danger"
                        : "bg-warning/15 text-warning"
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-mono text-xs font-bold text-primary truncate">
                      {t.referenceNumber}
                    </div>
                    <DualPrice
                      amountBDT={t.amount}
                      size="sm"
                      layout="stacked"
                      primaryClassName="text-text-primary shrink-0"
                    />
                  </div>

                  <div className="text-xs text-text-muted mb-2">
                    {t.paymentMethod?.name || "Wallet Top-Up"}
                  </div>

                  {t.rejectionReason && (
                    <div className="text-[10px] text-danger mb-1.5">
                      {t.rejectionReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        t.status === "APPROVED"
                          ? "bg-success/15 text-success"
                          : t.status === "REJECTED"
                            ? "bg-danger/15 text-danger"
                            : "bg-warning/15 text-warning"
                      }`}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>

                    <div className="flex items-center gap-1 text-xs text-text-muted group-hover:text-primary transition">
                      <span>
                        {new Date(t.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

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
                href={`/account/wallet/topups?${newParams.toString()}`}
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