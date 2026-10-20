"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  MessageSquare,
  Truck,
  Save,
  Loader2,
  ChevronDown,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  updateOrderStatusAction,
  approvePaymentAction,
  rejectPaymentAction,
  refundOrderAction,
  addInternalNoteAction,
  manualDeliveryAction,
  deleteOrderAction,
  type ActionState,
} from "../actions";
import type { AdminOrder } from "../queries";

const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "AWAITING_VERIFICATION",
  "PAID",
  "PROCESSING",
  "AWAITING_DELIVERY",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "ON_HOLD",
];

// Allowed statuses for deletion
const DELETE_ALLOWED_STATUSES = [
  "CANCELLED",
  "REFUNDED",
  "FAILED",
  "PARTIALLY_REFUNDED",
];

export function OrderActions({ order }: { order: AdminOrder }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isPaid = order.paymentStatus === "PAID";
  const isCompleted = order.status === "COMPLETED";
  const canDelete = true; // সব order delete করা যাবে

  const handleStatusChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateOrderStatusAction(
        { success: false },
        formData
      );
      if (result.success) {
        toast.success(result.message || "Updated");
        setOpenPanel(null);
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleAction = (
    action: (state: ActionState, fd: FormData) => Promise<ActionState>,
    form: HTMLFormElement,
    successMessage: string
  ) => {
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await action({ success: false }, formData);
      if (result.success) {
        toast.success(result.message || successMessage);
        setOpenPanel(null);
        router.refresh();
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrderAction(order.id);
      if (result.success) {
        toast.success(result.message || "Deleted");
        router.push("/admin/orders");
        router.refresh();
      } else {
        toast.error(result.message || "Delete failed");
        setConfirmDelete(false);
      }
    });
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 space-y-3">
      <h2 className="font-bold text-text-primary text-base mb-2">
        Admin Actions
      </h2>

      {/* Approve Payment */}
      {!isPaid && (
        <ActionButton
          icon={CheckCircle2}
          label="Approve Payment"
          color="success"
          onClick={() => setOpenPanel("approve")}
          active={openPanel === "approve"}
        />
      )}

      {/* Reject Payment */}
      {!isPaid && (
        <ActionButton
          icon={XCircle}
          label="Reject Payment"
          color="danger"
          onClick={() => setOpenPanel("reject")}
          active={openPanel === "reject"}
        />
      )}

      {/* Change Order Status */}
      <ActionButton
        icon={RefreshCw}
        label="Change Status"
        color="primary"
        onClick={() => setOpenPanel("status")}
        active={openPanel === "status"}
      />

      {/* Manual Delivery */}
      {!isCompleted && isPaid && (
        <ActionButton
          icon={Truck}
          label="Manual Delivery"
          color="accent"
          onClick={() => setOpenPanel("delivery")}
          active={openPanel === "delivery"}
        />
      )}

      {/* Refund */}
      {isPaid && (
        <ActionButton
          icon={XCircle}
          label="Refund"
          color="danger"
          onClick={() => setOpenPanel("refund")}
          active={openPanel === "refund"}
        />
      )}

      {/* Add Note */}
      <ActionButton
        icon={MessageSquare}
        label="Add Note"
        color="secondary"
        onClick={() => setOpenPanel("note")}
        active={openPanel === "note"}
      />

      {/* Delete Order — Separated */}
      <div className="pt-3 border-t border-border">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-danger/30 hover:border-danger text-danger hover:bg-danger/10 transition text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete Order
        </button>
        {!canDelete && (
          <p className="mt-2 text-[10px] text-text-muted text-center">
            ⚠️ শুধু CANCELLED, REFUNDED, FAILED status-এর order delete করা যাবে
          </p>
        )}
      </div>

      {/* ---- PANELS ---- */}

      {/* Approve Payment */}
      {openPanel === "approve" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(approvePaymentAction, e.currentTarget, "Approved");
          }}
          className="bg-success/5 border border-success/30 rounded-lg p-3 space-y-3"
        >
          <div className="text-xs font-semibold text-success">
            Approve this payment?
          </div>
          <input type="hidden" name="orderId" value={order.id} />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="markAsPaid"
              defaultChecked
              className="w-3.5 h-3.5"
            />
            <span className="text-text-primary">Mark as paid</span>
          </label>
          <textarea
            name="adminNote"
            rows={2}
            placeholder="Optional note..."
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary resize-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-success hover:bg-success/90 text-white font-medium py-2 rounded-lg transition text-xs flex items-center justify-center gap-1 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Confirm Approve
          </button>
        </form>
      )}

      {/* Reject Payment */}
      {openPanel === "reject" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(rejectPaymentAction, e.currentTarget, "Rejected");
          }}
          className="bg-danger/5 border border-danger/30 rounded-lg p-3 space-y-3"
        >
          <div className="text-xs font-semibold text-danger">
            Reject this payment?
          </div>
          <input type="hidden" name="orderId" value={order.id} />
          <textarea
            name="reason"
            required
            rows={3}
            placeholder="Reason (customer will see this)..."
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-danger resize-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-danger hover:bg-danger/90 text-white font-medium py-2 rounded-lg transition text-xs flex items-center justify-center gap-1 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            Confirm Reject
          </button>
        </form>
      )}

      {/* Change Status */}
      {openPanel === "status" && (
        <form
          onSubmit={handleStatusChange}
          className="bg-primary/5 border border-primary/30 rounded-lg p-3 space-y-3"
        >
          <div className="text-xs font-semibold text-primary">
            Change order status
          </div>
          <input type="hidden" name="orderId" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <input
            name="note"
            type="text"
            placeholder="Note (optional)"
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="notifyCustomer"
              className="w-3.5 h-3.5"
            />
            <span className="text-text-primary">Notify customer</span>
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition text-xs flex items-center justify-center gap-1 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Update Status
          </button>
        </form>
      )}

      {/* Manual Delivery */}
      {openPanel === "delivery" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(manualDeliveryAction, e.currentTarget, "Delivered");
          }}
          className="bg-accent/5 border border-accent/30 rounded-lg p-3 space-y-3"
        >
          <div className="text-xs font-semibold text-accent">
            Manual Delivery
          </div>
          <input type="hidden" name="orderId" value={order.id} />
          <input
            name="deliveryCode"
            type="text"
            placeholder="Delivery code (e.g. Gift card code)"
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary font-mono"
          />
          <textarea
            name="deliveryNote"
            rows={3}
            placeholder="Delivery note..."
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary resize-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2 rounded-lg transition text-xs flex items-center justify-center gap-1 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Truck className="w-3.5 h-3.5" />
            )}
            Mark Delivered
          </button>
        </form>
      )}

      {/* Refund */}
      {openPanel === "refund" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(refundOrderAction, e.currentTarget, "Refunded");
          }}
          className="bg-danger/5 border border-danger/30 rounded-lg p-3 space-y-3"
        >
          <div className="text-xs font-semibold text-danger">Refund</div>
          <input type="hidden" name="orderId" value={order.id} />
          <input
            name="amount"
            type="number"
            step="0.01"
            max={order.totalAmount}
            defaultValue={order.totalAmount}
            required
            placeholder="Refund amount"
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary focus:outline-none focus:border-danger"
          />
          <textarea
            name="reason"
            required
            rows={2}
            placeholder="Refund reason..."
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-danger resize-none"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="refundToWallet"
              defaultChecked
              className="w-3.5 h-3.5"
            />
            <span className="text-text-primary">Refund to wallet</span>
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-danger hover:bg-danger/90 text-white font-medium py-2 rounded-lg transition text-xs flex items-center justify-center gap-1 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            Confirm Refund
          </button>
        </form>
      )}

      {/* Add Note */}
      {openPanel === "note" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(addInternalNoteAction, e.currentTarget, "Note added");
          }}
          className="bg-bg-secondary border border-border rounded-lg p-3 space-y-3"
        >
          <div className="text-xs font-semibold text-text-primary">
            Add Internal Note
          </div>
          <input type="hidden" name="orderId" value={order.id} />
          <textarea
            name="note"
            required
            rows={3}
            placeholder="Internal note (only admins can see)..."
            className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary resize-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-bg-card border border-border hover:border-primary text-text-primary font-medium py-2 rounded-lg transition text-xs flex items-center justify-center gap-1 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" />
            )}
            Save Note
          </button>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border rounded-xl p-5 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  Order delete করবেন?
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Order number: <strong>{order.orderNumber}</strong>
                </p>
                <p className="text-sm text-text-muted mt-1">
                  এটা undo করা যাবে না।
                </p>
                {!canDelete && (
                  <p className="text-xs text-danger mt-2">
                    ⚠️ এই order-এর status <strong>{order.status}</strong> —
                    delete করা যাবে না। আগে CANCELLED/REFUNDED/FAILED করুন।
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending || !canDelete}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-danger/90 text-white font-medium transition flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  color,
  onClick,
  active,
}: {
  icon: any;
  label: string;
  color: "primary" | "success" | "danger" | "accent" | "secondary";
  onClick: () => void;
  active: boolean;
}) {
  const colors = {
    primary: "border-primary/30 hover:border-primary text-primary hover:bg-primary/10",
    success: "border-success/30 hover:border-success text-success hover:bg-success/10",
    danger: "border-danger/30 hover:border-danger text-danger hover:bg-danger/10",
    accent: "border-accent/30 hover:border-accent text-accent hover:bg-accent/10",
    secondary: "border-border hover:border-primary text-text-secondary hover:bg-bg-secondary",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
        active ? "border-primary bg-primary/10 text-primary" : colors[color]
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <ChevronDown
        className={`w-3.5 h-3.5 transition-transform ${
          active ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}