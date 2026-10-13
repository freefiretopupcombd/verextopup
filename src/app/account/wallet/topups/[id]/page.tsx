import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Copy,
  Smartphone,
  Hash,
} from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getTopUpById } from "@/modules/wallet/queries";
import { DualPrice } from "@/modules/currency/components/dual-price";

export const metadata: Metadata = {
  title: "Top-Up Details — VerexTopUp",
};

export default async function TopUpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const { id } = await params;
  const topUp = await getTopUpById(id, userId);

  if (!topUp) notFound();

  const isApproved = topUp.status === "APPROVED";
  const isRejected = topUp.status === "REJECTED";
  const isPending = topUp.status === "AWAITING_VERIFICATION";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <Link
          href="/account/wallet/topups"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Top-Up History-তে ফিরুন
        </Link>
      </div>

      {/* Status banner */}
      <div className="text-center">
        <div
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
            isApproved
              ? "bg-success/15 text-success"
              : isRejected
                ? "bg-danger/15 text-danger"
                : "bg-warning/15 text-warning"
          }`}
        >
          {isApproved ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : isRejected ? (
            <XCircle className="w-8 h-8" />
          ) : (
            <Clock className="w-8 h-8" />
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          {isApproved
            ? "Top-Up Approved"
            : isRejected
              ? "Top-Up Rejected"
              : "Under Review"}
        </h1>

        <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">
          {isApproved
            ? "আপনার wallet-এ balance যোগ হয়েছে"
            : isRejected
              ? topUp.rejectionReason || "Top-up reject হয়েছে"
              : "Admin যাচাই করছে। ৫-৩০ মিনিট সময় লাগতে পারে।"}
        </p>

        <div className="inline-flex items-center gap-2 bg-bg-card border border-border rounded-lg px-3 py-1.5 mt-3">
          <span className="text-xs text-text-muted">Reference:</span>
          <span className="font-mono font-bold text-primary text-xs">
            {topUp.referenceNumber}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
        <div className="text-xs text-text-muted mb-2">Top-Up Amount</div>
        <DualPrice
          amountBDT={topUp.amount}
          size="xl"
          layout="stacked"
          primaryClassName="text-primary"
        />
      </div>

      {/* Info */}
      <div className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center gap-3">
          <span className="text-xs text-text-muted">Payment Method</span>
          <span className="text-sm font-medium text-text-primary">
            {topUp.paymentMethod?.name || "—"}
          </span>
        </div>

        <div className="flex justify-between items-center gap-3">
          <span className="text-xs text-text-muted">Submitted</span>
          <span className="text-xs text-text-muted">
            {new Date(topUp.createdAt).toLocaleString("en-GB")}
          </span>
        </div>

        {topUp.verifiedAt && (
          <div className="flex justify-between items-center gap-3">
            <span className="text-xs text-text-muted">Verified</span>
            <span className="text-xs text-success">
              {new Date(topUp.verifiedAt).toLocaleString("en-GB")}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center gap-3">
          <span className="text-xs text-text-muted">Status</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              isApproved
                ? "bg-success/15 text-success"
                : isRejected
                  ? "bg-danger/15 text-danger"
                  : "bg-warning/15 text-warning"
            }`}
          >
            {topUp.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Submitted Fields (dynamic) */}
      {topUp.fields.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-bold text-text-primary mb-3">
            Submitted Information
          </h2>

          <div className="space-y-2">
            {topUp.fields.map((f) => {
              const Icon =
                f.role === "SENDER_NUMBER"
                  ? Smartphone
                  : f.role === "TRANSACTION_ID"
                    ? Hash
                    : null;

              return (
                <div
                  key={f.id}
                  className="flex justify-between items-center gap-3 text-sm"
                >
                  <div className="flex items-center gap-1.5 text-text-muted">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{f.label}</span>
                  </div>
                  <span className="font-mono text-text-primary text-sm truncate">
                    {f.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/account/wallet"
          className="flex-1 text-center bg-bg-card border border-border hover:border-primary text-text-primary font-medium px-6 py-3 rounded-lg transition"
        >
          Back to Wallet
        </Link>
        <Link
          href="/account/wallet/recharge"
          className="flex-1 text-center bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Top-Up Again
        </Link>
      </div>
    </div>
  );
}