import Link from "next/link";
import { ArrowUpCircle, ArrowDownCircle, ExternalLink } from "lucide-react";
import { REASON_LABELS } from "../validations";

type Txn = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reason: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
};

export function RecentTransactions({ transactions }: { transactions: Txn[] }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">
          এখনো কোনো transaction নেই
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-bold text-text-primary text-sm">
          Recent Transactions
        </h3>
        <Link
          href="/admin/wallets/transactions"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View All <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((t) => {
          const isCredit = t.type === "CREDIT";
          const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;

          return (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 hover:bg-bg-secondary/50 transition"
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {t.user?.name || t.user?.email || "Unknown"}
                  </span>
                  <span className="text-[10px] bg-bg-secondary text-text-muted px-1.5 py-0.5 rounded">
                    {REASON_LABELS[t.reason] || t.reason}
                  </span>
                </div>
                <div className="text-[11px] text-text-muted truncate mt-0.5">
                  {t.note || t.reference || "—"}
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
                <div className="text-[10px] text-text-muted">
                  {new Date(t.createdAt).toLocaleString("en-BD", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}