"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { REASON_LABELS } from "../validations";
import { TransactionDetailModal } from "./transaction-detail-modal";

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
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
  } | null;
  walletStatus: string;
};

export function TransactionsTable({ transactions }: { transactions: Txn[] }) {
  const [detail, setDetail] = useState<Txn | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-text-muted">কোনো transaction নেই</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  User
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  Reason
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                  Amount
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right hidden md:table-cell">
                  Balance After
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold hidden lg:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((t) => {
                const isCredit = t.type === "CREDIT";
                const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;

                return (
                  <tr key={t.id} className="hover:bg-bg-secondary/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCredit
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary truncate">
                            {t.user?.name || t.user?.email || "—"}
                          </div>
                          <div className="text-[10px] text-text-muted truncate">
                            {t.user?.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs bg-bg-secondary text-text-secondary px-2 py-0.5 rounded">
                        {REASON_LABELS[t.reason] || t.reason}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div
                        className={`font-bold ${
                          isCredit ? "text-success" : "text-danger"
                        }`}
                      >
                        {isCredit ? "+" : "−"}৳{t.amount.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="font-mono text-xs text-text-secondary">
                        ৳{t.balanceAfter.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-text-muted">
                        {new Date(t.createdAt).toLocaleString("en-BD", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(t)}
                        className="p-1.5 rounded-lg bg-bg-secondary text-text-muted hover:text-primary hover:bg-primary/10 transition"
                        title="View Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <TransactionDetailModal
          transaction={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}