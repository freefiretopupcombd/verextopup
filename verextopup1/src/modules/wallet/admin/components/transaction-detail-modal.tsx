"use client";

import { X, ArrowUpCircle, ArrowDownCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { REASON_LABELS } from "../validations";

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

export function TransactionDetailModal({
  transaction: t,
  onClose,
}: {
  transaction: Txn;
  onClose: () => void;
}) {
  const isCredit = t.type === "CREDIT";
  const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCredit
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm">
                Transaction Detail
              </h3>
              <p className="text-[10px] text-text-muted font-mono">
                {t.id.slice(0, 16)}...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Amount hero */}
          <div
            className={`rounded-lg p-4 text-center ${
              isCredit ? "bg-success/5" : "bg-danger/5"
            }`}
          >
            <div
              className={`text-3xl font-bold ${
                isCredit ? "text-success" : "text-danger"
              }`}
            >
              {isCredit ? "+" : "−"}৳{t.amount.toFixed(2)}
            </div>
            <div className="text-xs text-text-muted mt-1">
              {REASON_LABELS[t.reason] || t.reason}
            </div>
          </div>

          {/* Balance flow */}
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="grid grid-cols-3 items-center gap-2 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Before
                </div>
                <div className="text-sm font-mono text-text-secondary mt-0.5">
                  ৳{t.balanceBefore.toFixed(2)}
                </div>
              </div>
              <div className="text-text-muted text-xl">→</div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  After
                </div>
                <div
                  className={`text-sm font-mono font-bold mt-0.5 ${
                    isCredit ? "text-success" : "text-danger"
                  }`}
                >
                  ৳{t.balanceAfter.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* User */}
          {t.user && (
            <Section title="User">
              <Row label="Name" value={t.user.name || "—"} />
              <Row label="Email" value={t.user.email} />
              {t.user.phone && <Row label="Phone" value={t.user.phone} />}
              <Link
                href={`/admin/wallets/users/${t.user.id}`}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
              >
                View Full Wallet <ExternalLink className="w-3 h-3" />
              </Link>
            </Section>
          )}

          {/* Details */}
          <Section title="Details">
            <Row label="Status" value={t.status} />
            <Row
              label="Date"
              value={new Date(t.createdAt).toLocaleString()}
            />
            {t.reference && <Row label="Reference" value={t.reference} mono />}
            {t.adminId && (
              <Row label="Admin ID" value={t.adminId.slice(0, 12) + "..."} mono />
            )}
            {t.walletStatus === "FROZEN" && (
              <div className="text-xs text-danger bg-danger/10 px-2 py-1 rounded mt-1">
                ⚠️ Wallet currently FROZEN
              </div>
            )}
          </Section>

          {/* Note */}
          {t.note && (
            <Section title="Note">
              <p className="text-sm text-text-primary whitespace-pre-wrap bg-bg-secondary p-3 rounded-lg">
                {t.note}
              </p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-text-muted shrink-0">{label}:</span>
      <span
        className={`text-text-primary text-right break-all ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}