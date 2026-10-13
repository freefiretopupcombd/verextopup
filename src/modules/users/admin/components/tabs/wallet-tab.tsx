"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { REASON_LABELS } from "@/modules/wallet/admin/validations";
import { TransactionDetailModal } from "@/modules/wallet/admin/components/transaction-detail-modal";

type Txn = {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  reference: string | null;
  note: string | null;
  adminId: string | null;
  status: string;
  createdAt: string;
};

export function WalletTab({
  userId,
  wallet,
}: {
  userId: string;
  wallet: {
    balance: number;
    currency: string;
    status: string;
    totalCredited: number;
    totalDebited: number;
    creditCount: number;
    debitCount: number;
    transactions: Txn[];
  } | null;
}) {
  const [detail, setDetail] = useState<Txn | null>(null);

  if (!wallet) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-text-muted">এই user এর কোনো wallet নেই</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Balance summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Current Balance
            </div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              ৳{wallet.balance.toFixed(2)}
            </div>
            <div
              className={`text-[10px] font-bold uppercase mt-1 ${
                wallet.status === "FROZEN" ? "text-warning" : "text-success"
              }`}
            >
              {wallet.status}
            </div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-success font-medium">
              Total Credited
            </div>
            <div className="text-xl font-bold text-text-primary mt-1">
              ৳{wallet.totalCredited.toFixed(2)}
            </div>
            <div className="text-[10px] text-text-muted mt-1">
              {wallet.creditCount} transactions
            </div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-danger font-medium">
              Total Debited
            </div>
            <div className="text-xl font-bold text-text-primary mt-1">
              ৳{wallet.totalDebited.toFixed(2)}
            </div>
            <div className="text-[10px] text-text-muted mt-1">
              {wallet.debitCount} transactions
            </div>
          </div>
        </div>

        {/* View all transactions link */}
        <div className="flex justify-end">
          <Link
            href={`/admin/wallets/transactions?search=${userId}`}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            View All in Transaction Browser <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Transactions */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-bold text-text-primary text-sm">
              Recent Transactions ({wallet.transactions.length})
            </h3>
          </div>

          {wallet.transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-muted text-sm">কোনো transaction নেই</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {wallet.transactions.map((t) => {
                const isCredit = t.type === "CREDIT";
                const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;

                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary/40 transition"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isCredit
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text-primary">
                          {REASON_LABELS[t.reason] || t.reason}
                        </span>
                        {t.reference && (
                          <span className="text-[10px] text-text-muted font-mono">
                            {t.reference}
                          </span>
                        )}
                      </div>
                      {t.note && (
                        <div className="text-xs text-text-muted truncate mt-0.5">
                          {t.note}
                        </div>
                      )}
                      <div className="text-[10px] text-text-muted mt-0.5">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-bold ${
                          isCredit ? "text-success" : "text-danger"
                        }`}
                      >
                        {isCredit ? "+" : "−"}৳{t.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        → ৳{t.balanceAfter.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetail(t)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <TransactionDetailModal
          transaction={{ ...detail, user: null, walletStatus: wallet.status }}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}