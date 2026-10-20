"use client";

import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  ShoppingBag,
  Trash2,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  Wallet,
  Package,
  X,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Smartphone,
  Hash,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { DualPrice } from "@/modules/currency/components/dual-price";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./status-badges";
import { TopUpStatusBadge } from "@/modules/wallet/admin/components/status-badges";
import {
  approveTopUpAction,
  rejectTopUpAction,
} from "@/modules/wallet/actions";
import { bulkDeleteOrdersAction } from "../actions";
import type { UnifiedOrder } from "../queries";

// ==================================================
// TOPUP DETAIL MODAL (inline)
// ==================================================
function TopUpModal({
  order,
  onClose,
}: {
  order: UnifiedOrder;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [fullDetails, setFullDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch full details on mount
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/admin/wallet-topups/${order.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) {
          setFullDetails(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [order.id]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveTopUpAction(order.id, adminNote);
      if (result.success) {
        toast.success(result.message || "Approved");
        router.refresh();
        onClose();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleReject = () => {
    if (reason.trim().length < 3) {
      toast.error("কারণ দিন");
      return;
    }
    startTransition(async () => {
      const result = await rejectTopUpAction(order.id, reason);
      if (result.success) {
        toast.success("Rejected");
        router.refresh();
        onClose();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const isPendingStatus =
    order.status === "AWAITING_VERIFICATION" ||
    order.status === "PENDING_PAYMENT";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-bg-card border border-border rounded-xl max-w-lg w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-accent/15 text-accent flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-text-primary">
                Wallet Top-Up Details
              </h3>
            </div>
            <div className="text-xs font-mono text-primary mt-1">
              {order.referenceNumber}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Amount */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-center">
            <div className="text-xs text-text-muted mb-1">
              Recharge Amount
            </div>
            <DualPrice
              amountBDT={order.amount}
              size="xl"
              layout="stacked"
              primaryClassName="text-accent"
            />
          </div>

                    {/* Customer */}
          <div className="space-y-2">
            <Row label="Customer">
              <div>
                <div className="text-text-primary font-medium text-sm">
                  {order.customer.name || "Unknown"}
                </div>
                <div className="text-xs text-text-muted">
                  {order.customer.email}
                </div>
              </div>
            </Row>

            <Row label="Payment Method">
              <span className="text-text-primary font-medium text-sm">
                {order.paymentMethod?.name || "—"}
              </span>
            </Row>

            <Row label="Submitted">
              <span className="text-xs text-text-muted">
                {new Date(order.createdAt).toLocaleString("en-GB")}
              </span>
            </Row>

            <Row label="Status">
              <TopUpStatusBadge status={order.status} />
            </Row>
          </div>

          {/* Submitted Fields (fully dynamic) */}
          {fullDetails?.fields && fullDetails.fields.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2">
                Customer Submitted Data
              </div>

              {fullDetails.fields.map((f: any) => {
                const Icon =
                  f.role === "SENDER_NUMBER"
                    ? Smartphone
                    : f.role === "TRANSACTION_ID"
                      ? Hash
                      : null;

                const isCopyable =
                  f.role === "SENDER_NUMBER" ||
                  f.role === "TRANSACTION_ID";

                return (
                  <Row
                    key={f.id}
                    label={
                      <div className="flex items-center gap-1">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{f.label}</span>
                      </div>
                    }
                  >
                    {isCopyable ? (
                      <button
                        onClick={() =>
                          copyToClipboard(f.value, `field-${f.id}`)
                        }
                        className="inline-flex items-center gap-1.5 font-mono text-sm text-text-primary hover:text-primary truncate max-w-[200px]"
                      >
                        <span className="truncate">{f.value}</span>
                        {copiedField === `field-${f.id}` ? (
                          <Check className="w-3 h-3 text-success shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 text-text-muted shrink-0" />
                        )}
                      </button>
                    ) : (
                      <span className="font-mono text-sm text-text-primary truncate max-w-[200px]">
                        {f.value}
                      </span>
                    )}
                  </Row>
                );
              })}
            </div>
          )}

          {/* Screenshot */}
          {fullDetails?.screenshotUrl && (
            <div className="pt-3 border-t border-border">
              <Row label="Screenshot">
                <a
                  href={fullDetails.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Row>
            </div>
          )}

          {/* Rejection Reason */}
          {fullDetails?.rejectionReason && (
            <div className="bg-danger/10 border border-danger/30 rounded p-2.5 text-xs text-danger">
              <div className="font-bold mb-0.5">Rejected</div>
              {fullDetails.rejectionReason}
            </div>
          )}

          {/* Actions */}
          {isPendingStatus && (
            <div className="space-y-3 pt-3 border-t border-border">
              {!actionType && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActionType("approve")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-success hover:bg-success/90 text-white font-semibold transition text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setActionType("reject")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-danger hover:bg-danger/90 text-white font-semibold transition text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {actionType === "approve" && (
                <div className="bg-success/5 border border-success/30 rounded-lg p-3 space-y-3">
                  <div className="text-xs font-semibold text-success">
                    Approve এই top-up?
                  </div>
                  <p className="text-xs text-text-muted">
                    ৳{order.amount.toFixed(2)} customer-এর wallet-এ যোগ হবে।
                  </p>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={2}
                    placeholder="Admin note (optional)"
                    className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-success resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActionType(null)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border text-text-secondary text-xs hover:bg-bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isPending}
                      className="flex-1 px-3 py-2 rounded-lg bg-success hover:bg-success/90 text-white text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {actionType === "reject" && (
                <div className="bg-danger/5 border border-danger/30 rounded-lg p-3 space-y-3">
                  <div className="text-xs font-semibold text-danger">
                    Reject এই top-up?
                  </div>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Rejection reason (customer will see this)"
                    className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-danger resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActionType(null)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border text-text-secondary text-xs hover:bg-bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isPending || reason.trim().length < 3}
                      className="flex-1 px-3 py-2 rounded-lg bg-danger hover:bg-danger/90 text-white text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isPendingStatus && order.status === "COMPLETED" && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <div className="text-xs text-text-secondary">
                Approved এবং wallet-এ যোগ হয়েছে
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-text-muted shrink-0">{label}</span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

// ==================================================
// MAIN ORDER TABLE
// ==================================================
export function OrderTable({ orders }: { orders: UnifiedOrder[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState<UnifiedOrder | null>(null);

  const productOrderIds = orders
    .filter((o) => o.type === "PRODUCT_ORDER")
    .map((o) => o.id);

  const toggleSelect = (id: string, type: string) => {
    if (type !== "PRODUCT_ORDER") {
      toast.info("Wallet top-ups bulk delete করা যাবে না");
      return;
    }
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === productOrderIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(productOrderIds));
    }
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    startTransition(async () => {
      const result = await bulkDeleteOrdersAction(ids);
      if (result.success) {
        toast.success(result.message || "Deleted");
        setSelectedIds(new Set());
        setConfirmBulkDelete(false);
        router.refresh();
      } else {
        toast.error(result.message || "Delete failed");
        setConfirmBulkDelete(false);
      }
    });
  };

  const handleView = (order: UnifiedOrder) => {
    if (order.type === "WALLET_TOPUP") {
      // Open modal for top-ups
      setSelectedTopUp(order);
    }
    // Product orders use Link
  };

  if (orders.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 sm:p-14 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">
          কোনো order পাওয়া যায়নি
        </h3>
        <p className="text-sm text-text-muted">
          Filter change করে আবার দেখুন।
        </p>
      </div>
    );
  }

  const allSelected =
    productOrderIds.length > 0 && selectedIds.size === productOrderIds.length;

  return (
    <>
      <div className="space-y-3">
        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckSquare className="w-4 h-4" />
              <span className="font-medium">
                {selectedIds.size} টা order select করা হয়েছে
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-bg-secondary text-xs text-text-secondary"
              >
                Clear
              </button>
              <button
                onClick={() => setConfirmBulkDelete(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger hover:bg-danger/90 text-white text-xs font-medium disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedIds.size})
              </button>
            </div>
          </div>
        )}

        {/* Desktop table */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="text-primary hover:text-primary-dark"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-text-primary">
                    Order
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-text-primary">
                    Customer
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-text-primary">
                    Item
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-text-primary">
                    Payment
                  </th>
                  <th className="text-right px-3 py-3 font-semibold text-text-primary">
                    Total
                  </th>
                  <th className="text-center px-3 py-3 font-semibold text-text-primary">
                    Status
                  </th>
                  <th className="text-right px-3 py-3 font-semibold text-text-primary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const isSelected = selectedIds.has(o.id);
                  const isTopUp = o.type === "WALLET_TOPUP";

                  return (
                    <tr
                      key={o.id}
                      className={`border-b border-border last:border-0 transition ${
                        isSelected ? "bg-primary/5" : "hover:bg-bg-secondary/50"
                      }`}
                    >
                      <td className="px-3 py-3">
                        {isTopUp ? (
                          <div className="w-4 h-4 flex items-center justify-center">
                            <Square className="w-4 h-4 text-text-dim/30" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleSelect(o.id, o.type)}
                            className="text-primary hover:text-primary-dark"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-text-muted" />
                            )}
                          </button>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-mono text-xs font-bold text-primary">
                          {o.referenceNumber}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-sm text-text-primary font-medium truncate max-w-[180px]">
                          {o.customer.name || "Guest"}
                        </div>
                        <div className="text-[10px] text-text-muted truncate max-w-[180px]">
                          {o.customer.email}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {isTopUp ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-md bg-accent/15 text-accent flex items-center justify-center shrink-0">
                              <Wallet className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-accent">
                                Wallet Top-Up
                              </div>
                              <div className="text-[10px] text-text-muted">
                                Recharge
                              </div>
                            </div>
                          </div>
                        ) : o.productInfo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
                              <Package className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-text-primary truncate max-w-[160px] font-medium">
                                {o.productInfo.productName}
                              </div>
                              <div className="text-[10px] text-text-muted">
                                {o.productInfo.variantName}
                                {o.productInfo.itemCount > 1 &&
                                  ` +${o.productInfo.itemCount - 1} more`}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-xs text-text-secondary">
                          {o.paymentMethod?.name || "—"}
                        </div>
                        <div className="mt-1">
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <DualPrice
                          amountBDT={o.amount}
                          size="sm"
                          layout="stacked"
                          primaryClassName="text-text-primary"
                        />
                      </td>

                      <td className="px-3 py-3 text-center">
                        <OrderStatusBadge status={o.status} />
                      </td>

                      <td className="px-3 py-3 text-right">
                        {isTopUp ? (
                          <button
                            onClick={() => handleView(o)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        ) : (
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-border">
            {orders.map((o) => {
              const isSelected = selectedIds.has(o.id);
              const isTopUp = o.type === "WALLET_TOPUP";

              return (
                <div
                  key={o.id}
                  className={`flex gap-3 p-4 ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  {isTopUp ? (
                    <div className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSelect(o.id, o.type)}
                      className="text-primary shrink-0 mt-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-text-muted" />
                      )}
                    </button>
                  )}

                  {isTopUp ? (
                    <button
                      onClick={() => handleView(o)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <MobileOrderCard o={o} isTopUp={true} />
                    </button>
                  ) : (
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex-1 min-w-0"
                    >
                      <MobileOrderCard o={o} isTopUp={false} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top-Up Modal */}
      {selectedTopUp && (
        <TopUpModal
          order={selectedTopUp}
          onClose={() => setSelectedTopUp(null)}
        />
      )}

      {/* Bulk Delete Confirm */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border rounded-xl p-5 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  {selectedIds.size} টা order delete করবেন?
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  এটা undo করা যাবে না।
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-danger/90 text-white font-medium transition flex items-center gap-2 text-sm disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete {selectedIds.size}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileOrderCard({ o, isTopUp }: { o: UnifiedOrder; isTopUp: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="font-mono text-xs font-bold text-primary">
            {o.referenceNumber}
          </div>
          <div
            className={`text-[10px] font-semibold mt-0.5 ${
              isTopUp ? "text-accent" : "text-text-muted"
            }`}
          >
            {isTopUp ? "Wallet Top-Up" : "Product Order"}
          </div>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>

      <div className="text-sm text-text-primary font-medium truncate mb-0.5">
        {o.customer.name || "Guest"}
      </div>
      <div className="text-[10px] text-text-muted truncate mb-2">
        {o.customer.email}
      </div>

      {o.productInfo && (
        <div className="text-xs text-text-secondary truncate mb-2">
          {o.productInfo.productName}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">
            {o.paymentMethod?.name || "—"}
          </span>
          <PaymentStatusBadge status={o.paymentStatus} />
        </div>
        <DualPrice
          amountBDT={o.amount}
          size="sm"
          layout="stacked"
          primaryClassName="text-primary"
        />
      </div>
    </>
  );
}