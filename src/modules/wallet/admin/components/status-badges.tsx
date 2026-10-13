"use client";

export function TopUpStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-warning/15 text-warning",
    AWAITING_VERIFICATION: "bg-primary/15 text-primary",
    APPROVED: "bg-success/15 text-success",
    REJECTED: "bg-danger/15 text-danger",
    CANCELLED: "bg-text-muted/15 text-text-muted",
  };

  const labels: Record<string, string> = {
    PENDING: "Pending",
    AWAITING_VERIFICATION: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
        styles[status] || "bg-text-muted/15 text-text-muted"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}