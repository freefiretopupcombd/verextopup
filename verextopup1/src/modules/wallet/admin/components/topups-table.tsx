"use client";

import { useState } from "react";
import {
  Eye,
  Check,
  X as XIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { ApproveTopUpModal } from "./approve-topup-modal";
import { RejectTopUpModal } from "./reject-topup-modal";
import { TopUpDetailModal } from "./topup-detail-modal";

type TopUp = {
  id: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: string;
  senderNumber: string | null;
  transactionId: string | null;
  screenshotUrl: string | null;
  customerNote: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  verifiedAt: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
  };
  paymentMethod: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  fields: {
    id: string;
    name: string;
    label: string;
    value: string;
    role: string | null;
  }[];
};

export function TopUpsTable({ topUps }: { topUps: TopUp[] }) {
  const [detail, setDetail] = useState<TopUp | null>(null);
  const [approve, setApprove] = useState<TopUp | null>(null);
  const [reject, setReject] = useState<TopUp | null>(null);

  if (topUps.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
        <p className="text-text-muted">কোনো top-up request নেই 🎉</p>
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
                  User / Reference
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                  Amount
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold hidden md:table-cell">
                  Method
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topUps.map((t) => {
                const isPending =
                  t.status === "PENDING" || t.status === "AWAITING_VERIFICATION";
                const isApproved = t.status === "APPROVED";
                const isRejected = t.status === "REJECTED";

                return (
                  <tr key={t.id} className="hover:bg-bg-secondary/40 transition">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-text-primary">
                          {t.user.name || t.user.email}
                        </div>
                        <div className="text-[11px] text-text-muted font-mono">
                          {t.referenceNumber}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-text-primary">
                        ৳{t.amount.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-text-secondary">
                        {t.paymentMethod?.name || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-warning/15 text-warning px-2 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" />
                          Pending
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-success/15 text-success px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-danger/15 text-danger px-2 py-0.5 rounded">
                          <XCircle className="w-2.5 h-2.5" />
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDetail(t)}
                          className="p-1.5 rounded-lg bg-bg-secondary text-text-muted hover:text-primary hover:bg-primary/10 transition"
                          title="View Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => setApprove(t)}
                              className="px-2.5 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition text-xs font-medium inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setReject(t)}
                              className="px-2.5 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition text-xs font-medium inline-flex items-center gap-1"
                            >
                              <XIcon className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <TopUpDetailModal topUp={detail} onClose={() => setDetail(null)} />
      )}
      {approve && (
        <ApproveTopUpModal topUp={approve} onClose={() => setApprove(null)} />
      )}
      {reject && (
        <RejectTopUpModal topUp={reject} onClose={() => setReject(null)} />
      )}
    </>
  );
}