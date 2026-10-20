import { ShoppingBag, Star, Headphones, Wallet } from "lucide-react";

export function UserStats({
  orderCount,
  orderTotal,
  reviewCount,
  ticketCount,
  walletBalance,
}: {
  orderCount: number;
  orderTotal: number;
  reviewCount: number;
  ticketCount: number;
  walletBalance: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Wallet}
        label="Wallet Balance"
        value={`৳${walletBalance.toFixed(2)}`}
        color="primary"
      />
      <StatCard
        icon={ShoppingBag}
        label="Total Orders"
        value={`${orderCount}`}
        subtitle={`৳${orderTotal.toFixed(2)} spent`}
        color="success"
      />
      <StatCard
        icon={Star}
        label="Reviews"
        value={`${reviewCount}`}
        color="warning"
      />
      <StatCard
        icon={Headphones}
        label="Support Tickets"
        value={`${ticketCount}`}
        color="accent"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  subtitle?: string;
  color: "primary" | "success" | "warning" | "accent";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div
        className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className="text-lg font-bold text-text-primary mt-0.5 truncate">
        {value}
      </div>
      {subtitle && (
        <div className="text-[10px] text-text-muted mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}