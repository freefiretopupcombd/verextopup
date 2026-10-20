"use client";

import Link from "next/link";
import {
  Wallet as WalletIcon,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";

import { DualPrice } from "@/modules/currency/components/dual-price";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  reference: string | null;
  note: string | null;
  status: string;
  createdAt: string;
};

type TopUp = {
  id: string;
  referenceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  rejectionReason: string | null;
};

export function WalletView({
  balance,
  transactions,
  topUps,
}: {
  balance: number;
  transactions: Transaction[];
  topUps: TopUp[];
}) {
  return (
    <div className="space-y-5">
      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/40 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <WalletIcon className="w-5 h-5" />
            <span className="text-sm opacity-90">Wallet Balance</span>
          </div>

          <div className="text-3xl sm:text-4xl font-bold mb-5">
            ৳{balance.toFixed(2)}
          </div>

          <Link
            href="/account/wallet/recharge"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg transition hover:bg-white/90"
          >
            <Plus className="w-4 h-4" />
            Recharge Now
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-xs text-text-muted">Credits</span>
          </div>
          <div className="text-lg font-bold text-text-primary">
            ৳
            {transactions
              .filter((t) => t.type === "CREDIT")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-xs text-text-muted">Debits</span>
          </div>
          <div className="text-lg font-bold text-text-primary">
            ৳
            {transactions
              .filter((t) => t.type === "DEBIT")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </div>
        </div>
      </div>

      {/* Pending Top-Ups */}
      {topUps.filter((t) => t.status === "AWAITING_VERIFICATION").length >
        0 && (
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-warning" />
            <h2 className="font-bold text-text-primary text-sm">
              Pending Top-Ups
            </h2>
          </div>
          <div className="space-y-2">
            {topUps
              .filter((t) => t.status === "AWAITING_VERIFICATION")
              .map((topUp) => (
                <div
                  key={topUp.id}
                  className="flex items-center justify-between gap-3 bg-warning/5 border border-warning/20 rounded-lg p-3"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold text-primary truncate">
                      {topUp.referenceNumber}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {new Date(topUp.createdAt).toLocaleString("en-GB")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <DualPrice
                      amountBDT={topUp.amount}
                      size="sm"
                      layout="stacked"
                      primaryClassName="text-text-primary"
                    />
                    <div className="text-[10px] text-warning mt-0.5">
                      UNDER REVIEW
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-text-primary text-sm">
              Recent Transactions
            </h2>
          </div>
          {transactions.length > 0 && (
            <Link
              href="/account/wallet/transactions"
              className="text-xs text-primary hover:underline font-medium"
            >
              View All
            </Link>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">
              এখনো কোনো transaction নেই
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      t.type === "CREDIT"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {t.type === "CREDIT" ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary capitalize">
                      {t.reason.toLowerCase().replace(/_/g, " ")}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {new Date(t.createdAt).toLocaleString("en-GB")}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold ${
                      t.type === "CREDIT" ? "text-success" : "text-warning"
                    }`}
                  >
                    {t.type === "CREDIT" ? "+" : "−"}৳{t.amount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    ৳{t.balanceAfter.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top-Up History */}
      {topUps.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
          <h2 className="font-bold text-text-primary text-sm mb-4">
            Top-Up History
          </h2>
          <div className="space-y-2">
            {topUps.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs text-text-primary">
                    {t.referenceNumber}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {new Date(t.createdAt).toLocaleString("en-GB")}
                  </div>
                  {t.rejectionReason && (
                    <div className="text-[10px] text-danger mt-0.5">
                      {t.rejectionReason}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-text-primary">
                    ৳{t.amount.toFixed(2)}
                  </div>
                  <div
                    className={`text-[10px] font-medium mt-0.5 flex items-center justify-end gap-1 ${
                      t.status === "APPROVED"
                        ? "text-success"
                        : t.status === "REJECTED"
                          ? "text-danger"
                          : "text-warning"
                    }`}
                  >
                    {t.status === "APPROVED" && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {t.status === "REJECTED" && (
                      <XCircle className="w-3 h-3" />
                    )}
                    {t.status === "AWAITING_VERIFICATION" && (
                      <Clock className="w-3 h-3" />
                    )}
                    {t.status.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}