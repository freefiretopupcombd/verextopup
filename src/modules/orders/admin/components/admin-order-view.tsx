"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  CreditCard,
  History,
  FileText,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Hash,
  Clock,
} from "lucide-react";

import { DualPrice } from "@/modules/currency/components/dual-price";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  DeliveryStatusBadge,
} from "./status-badges";
import { OrderActions } from "./order-actions";
import type { AdminOrder } from "../queries";

export function AdminOrderView({ order }: { order: AdminOrder }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
      {/* LEFT COLUMN */}
      <div className="space-y-5">
        {/* Order Items */}
        <Card icon={Package} title="Order Items">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/15 to-bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {item.product?.thumbnail ? (
                    <img
                      src={item.product.thumbnail}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : item.product?.icon ? (
                    <span className="text-2xl">{item.product.icon}</span>
                  ) : (
                    <span className="text-2xl">🎮</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary text-sm">
                    {item.productName}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {item.variantName} × {item.quantity}
                  </div>

                  <div className="mt-1.5">
                    <DeliveryStatusBadge status={item.deliveryStatus} />
                  </div>

                  {/* Product custom fields (Player ID etc.) */}
                  {item.fields.length > 0 && (
                    <div className="mt-2 space-y-1 bg-bg-secondary rounded-lg p-2">
                      {item.fields.map((f, i) => (
                        <div
                          key={i}
                          className="flex justify-between gap-2 text-xs"
                        >
                          <span className="text-text-muted">
                            {f.fieldLabel}:
                          </span>
                          <span className="text-text-primary font-mono">
                            {f.fieldValue}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.deliveryData && (
                    <div className="mt-2 bg-success/5 border border-success/20 rounded-lg p-2">
                      <div className="text-[10px] text-success font-semibold mb-1">
                        DELIVERY INFO
                      </div>
                      <pre className="text-[10px] text-text-secondary whitespace-pre-wrap font-mono">
                        {JSON.stringify(item.deliveryData, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      ৳{item.unitPrice.toFixed(2)} each
                    </span>
                    <DualPrice
                      amountBDT={item.totalPrice}
                      size="sm"
                      layout="stacked"
                      primaryClassName="text-text-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ==================================================
            PAYMENT INFORMATION — FULL DETAILS
        ================================================== */}
        {order.paymentMethod && (
          <Card icon={CreditCard} title="Payment Information">
            <div className="space-y-3">
              {/* Method */}
              <InfoRow label="Method">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-medium">
                    {order.paymentMethod.name}
                  </span>
                  {order.paymentMethod.isSnapshot && (
                    <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded">
                      Deleted
                    </span>
                  )}
                </div>
              </InfoRow>

              {/* Receiving account (merchant) */}
              {order.paymentMethod.accountNumber && (
                <InfoRow label="Receiving Account">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        order.paymentMethod!.accountNumber!,
                        "acc"
                      )
                    }
                    className="inline-flex items-center gap-2 font-mono text-sm text-text-primary hover:text-primary"
                  >
                    {order.paymentMethod.accountNumber}
                    {copiedField === "acc" ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <Copy className="w-3 h-3 text-text-muted" />
                    )}
                  </button>
                </InfoRow>
              )}

              {/* ========================================
                  SUBMITTED PAYMENT DETAILS
              ======================================== */}
              {order.payments.length > 0 && (
                <>
                  {order.payments.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-primary/5 border border-primary/20 rounded-lg p-3.5 space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                          Customer Payment Details
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.status === "SUCCESS"
                              ? "bg-success/15 text-success"
                              : p.status === "FAILED"
                                ? "bg-danger/15 text-danger"
                                : "bg-warning/15 text-warning"
                          }`}
                        >
                          {p.status === "SUCCESS"
                            ? "VERIFIED"
                            : p.status === "FAILED"
                              ? "REJECTED"
                              : "UNDER REVIEW"}
                        </span>
                      </div>

                      {/* Sender Number */}
                      {p.senderNumber && (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Sender Number</span>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                p.senderNumber!,
                                `sender-${p.id}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 font-mono text-sm text-text-primary hover:text-primary transition"
                          >
                            <span>{p.senderNumber}</span>
                            {copiedField === `sender-${p.id}` ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3 text-text-muted" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Transaction ID */}
                      {p.transactionId && (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                            <Hash className="w-3.5 h-3.5" />
                            <span>Transaction ID</span>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                p.transactionId!,
                                `txn-${p.id}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 font-mono text-sm text-text-primary hover:text-primary transition truncate max-w-[200px]"
                          >
                            <span className="truncate">
                              {p.transactionId}
                            </span>
                            {copiedField === `txn-${p.id}` ? (
                              <Check className="w-3 h-3 text-success shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-text-muted shrink-0" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Dynamic submitted fields */}
                      {p.fields &&
                        Object.entries(p.fields).map(([key, value]) => {
                          // Skip already-displayed fields
                          const skip = [
                            "transaction_id",
                            "txn_id",
                            "transactionId",
                            "sender_number",
                            "mobile_number",
                          ];
                          if (skip.includes(key)) return null;

                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between gap-3 text-xs"
                            >
                              <span className="text-text-muted capitalize shrink-0">
                                {key.replace(/_/g, " ")}
                              </span>
                              <span className="text-text-primary font-mono truncate">
                                {String(value)}
                              </span>
                            </div>
                          );
                        })}

                      {/* Also show mobile_number if present but no senderNumber */}
                      {!p.senderNumber && p.fields?.mobile_number && (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Mobile Number</span>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                p.fields.mobile_number,
                                `mob-${p.id}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 font-mono text-sm text-text-primary hover:text-primary transition"
                          >
                            <span>{p.fields.mobile_number}</span>
                            {copiedField === `mob-${p.id}` ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3 text-text-muted" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Customer Note */}
                      {p.customerNote && (
                        <div className="pt-2.5 border-t border-border/50">
                          <div className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">
                            Customer Note
                          </div>
                          <p className="text-xs text-text-secondary italic">
                            "{p.customerNote}"
                          </p>
                        </div>
                      )}

                      {/* Submitted time */}
                      {p.submittedAt && (
                        <div className="flex items-center gap-1.5 text-[10px] text-text-dim pt-2 border-t border-border/50">
                          <Clock className="w-3 h-3" />
                          Submitted:{" "}
                          {new Date(p.submittedAt).toLocaleString("en-GB")}
                        </div>
                      )}

                      {/* Screenshot */}
                      {p.screenshotUrl && (
                        <div className="flex items-center justify-between gap-3 text-xs pt-1">
                          <span className="text-text-muted">Screenshot</span>
                          <a
                            href={p.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {p.rejectionReason && (
                        <div className="bg-danger/10 border border-danger/30 rounded p-2 text-xs text-danger">
                          <div className="font-bold mb-0.5">
                            Rejection Reason
                          </div>
                          {p.rejectionReason}
                        </div>
                      )}

                      {/* Verified */}
                      {p.verifiedAt && (
                        <div className="flex items-center gap-1.5 text-[10px] text-success pt-2 border-t border-border/50">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified:{" "}
                          {new Date(p.verifiedAt).toLocaleString("en-GB")}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>
        )}

        {/* Customer Info */}
        <Card icon={User} title="Customer Information">
          <div className="space-y-3">
            <InfoRow label="Name">
              <span className="text-text-primary font-medium">
                {order.customer.name || "Guest"}
              </span>
            </InfoRow>
            <InfoRow label="Email">
              <span className="text-text-primary font-mono text-sm">
                {order.customer.email}
              </span>
            </InfoRow>
            {order.customer.phone && (
              <InfoRow label="Phone">
                <span className="text-text-primary font-mono text-sm">
                  {order.customer.phone}
                </span>
              </InfoRow>
            )}
            {order.customer.id && (
              <InfoRow label="User ID">
                <span className="text-text-muted font-mono text-xs">
                  {order.customer.id}
                </span>
              </InfoRow>
            )}

            {order.ipAddress && (
              <InfoRow label="IP Address">
                <span className="text-text-muted font-mono text-xs">
                  {order.ipAddress}
                </span>
              </InfoRow>
            )}
          </div>
        </Card>

        {/* Status Timeline */}
        <Card icon={History} title="Status Timeline">
          <div className="space-y-3">
            {order.statusHistory.map((h) => (
              <div key={h.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <OrderStatusBadge status={h.status} />
                    <span className="text-[10px] text-text-muted">
                      {new Date(h.createdAt).toLocaleString("en-GB")}
                    </span>
                  </div>
                  {h.note && (
                    <p className="text-xs text-text-secondary mt-1">
                      {h.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        {(order.customerNote || order.internalNote) && (
          <Card icon={FileText} title="Notes">
            {order.customerNote && (
              <div className="mb-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">
                  Customer Note
                </div>
                <div className="bg-bg-secondary rounded-lg p-3 text-sm text-text-primary whitespace-pre-wrap">
                  {order.customerNote}
                </div>
              </div>
            )}

            {order.internalNote && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">
                  Internal Notes
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-xs text-text-secondary whitespace-pre-wrap font-mono">
                  {order.internalNote}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        {/* Summary */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text-primary text-base">Summary</h2>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Status</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Payment</span>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Subtotal</span>
              <DualPrice
                amountBDT={order.subtotal}
                size="sm"
                layout="stacked"
                primaryClassName="text-text-primary"
              />
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Discount</span>
                <span className="text-success">
                  −৳{order.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-border flex justify-between items-start">
              <span className="font-semibold text-text-primary">Total</span>
              <DualPrice
                amountBDT={order.totalAmount}
                size="lg"
                layout="stacked"
                primaryClassName="text-primary"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border text-xs text-text-muted space-y-1">
            <div>
              Created: {new Date(order.createdAt).toLocaleString("en-GB")}
            </div>
            {order.paidAt && (
              <div>
                Paid: {new Date(order.paidAt).toLocaleString("en-GB")}
              </div>
            )}
          </div>
        </div>

        <OrderActions order={order} />
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-bold text-text-primary text-sm sm:text-base">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-text-muted shrink-0">{label}</span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}