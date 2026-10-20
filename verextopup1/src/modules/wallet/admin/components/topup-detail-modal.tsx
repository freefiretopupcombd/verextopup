"use client";

import { X, ExternalLink } from "lucide-react";

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

export function TopUpDetailModal({
  topUp,
  onClose,
}: {
  topUp: TopUp;
  onClose: () => void;
}) {
  const statusColor = {
    PENDING: "text-warning bg-warning/10",
    AWAITING_VERIFICATION: "text-warning bg-warning/10",
    APPROVED: "text-success bg-success/10",
    REJECTED: "text-danger bg-danger/10",
  }[topUp.status] || "text-text-muted bg-bg-secondary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="min-w-0">
            <h3 className="font-bold text-text-primary">Top-Up Detail</h3>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">
              {topUp.referenceNumber}
            </p>
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
          {/* Status + Amount */}
          <div className="flex items-center justify-between gap-3 bg-bg-secondary rounded-lg p-3">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${statusColor}`}>
              {topUp.status.replace("_", " ")}
            </span>
            <span className="text-2xl font-bold text-text-primary">
              ৳{topUp.amount.toFixed(2)}
            </span>
          </div>

          {/* User Info */}
          <Section title="User">
            <Row label="Name" value={topUp.user.name || "—"} />
            <Row label="Email" value={topUp.user.email} />
            <Row label="Phone" value={topUp.user.phone || "—"} />
          </Section>

          {/* Payment Info */}
          <Section title="Payment Info">
            <Row label="Method" value={topUp.paymentMethod?.name || "—"} />
            <Row label="Sender Number" value={topUp.senderNumber || "—"} mono />
            <Row label="Transaction ID" value={topUp.transactionId || "—"} mono />
          </Section>

          {/* Dynamic Fields */}
          {topUp.fields.length > 0 && (
            <Section title="Submitted Fields">
              {topUp.fields.map((f) => (
                <Row key={f.id} label={f.label} value={f.value} mono />
              ))}
            </Section>
          )}

          {/* Screenshot */}
          {topUp.screenshotUrl && (
            <Section title="Screenshot">
              <a
                href={topUp.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
              >
                View Full Size <ExternalLink className="w-3 h-3" />
              </a>
              <img
                src={topUp.screenshotUrl}
                alt="Payment screenshot"
                className="mt-2 rounded-lg border border-border max-h-64 object-contain w-full"
              />
            </Section>
          )}

          {/* Notes */}
          {topUp.customerNote && (
            <Section title="Customer Note">
              <p className="text-sm text-text-primary whitespace-pre-wrap">
                {topUp.customerNote}
              </p>
            </Section>
          )}

          {topUp.adminNote && (
            <Section title="Admin Note">
              <p className="text-sm text-text-primary whitespace-pre-wrap">
                {topUp.adminNote}
              </p>
            </Section>
          )}

          {topUp.rejectionReason && (
            <Section title="Rejection Reason">
              <p className="text-sm text-danger whitespace-pre-wrap">
                {topUp.rejectionReason}
              </p>
            </Section>
          )}

          {/* Timestamps */}
          <Section title="Timeline">
            <Row
              label="Submitted"
              value={new Date(topUp.createdAt).toLocaleString()}
            />
            {topUp.verifiedAt && (
              <Row
                label="Verified"
                value={new Date(topUp.verifiedAt).toLocaleString()}
              />
            )}
          </Section>
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
        className={`text-text-primary text-right break-all ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}