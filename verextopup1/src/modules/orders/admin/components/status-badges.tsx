"use client";

export function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING_PAYMENT: "bg-warning/15 text-warning",
    PAID: "bg-success/15 text-success",
    PROCESSING: "bg-primary/15 text-primary",
    AWAITING_DELIVERY: "bg-primary/15 text-primary",
    COMPLETED: "bg-success/15 text-success",
    FAILED: "bg-danger/15 text-danger",
    CANCELLED: "bg-text-muted/15 text-text-muted",
    REFUNDED: "bg-text-muted/15 text-text-muted",
    PARTIALLY_REFUNDED: "bg-text-muted/15 text-text-muted",
    ON_HOLD: "bg-warning/15 text-warning",
    AWAITING_VERIFICATION: "bg-warning/15 text-warning",
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
        styles[status] || "bg-text-muted/15 text-text-muted"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    UNPAID: "bg-warning/15 text-warning",
    PENDING: "bg-warning/15 text-warning",
    PAID: "bg-success/15 text-success",
    FAILED: "bg-danger/15 text-danger",
    REFUNDED: "bg-text-muted/15 text-text-muted",
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
        styles[status] || "bg-text-muted/15 text-text-muted"
      }`}
    >
      {status}
    </span>
  );
}

export function DeliveryStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-warning/15 text-warning",
    PROCESSING: "bg-primary/15 text-primary",
    DELIVERED: "bg-success/15 text-success",
    FAILED: "bg-danger/15 text-danger",
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
        styles[status] || "bg-text-muted/15 text-text-muted"
      }`}
    >
      {status}
    </span>
  );
}