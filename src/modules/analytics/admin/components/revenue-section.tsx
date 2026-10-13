import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Wallet,
} from "lucide-react";

export function RevenueSection({
  data,
}: {
  data: {
    current: {
      productRevenue: number;
      topUpRevenue: number;
      totalRevenue: number;
      productOrders: number;
      topUpCount: number;
    };
    previous: { totalRevenue: number };
    growthPercent: number;
  };
}) {
  const growth = data.growthPercent;
  const isPositive = growth >= 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
          Revenue Overview
        </h2>
        <div
          className={`flex items-center gap-1 text-xs font-bold ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {isPositive ? "+" : ""}
          {growth.toFixed(1)}% vs previous period
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          icon={DollarSign}
          label="Total Revenue"
          value={`৳${data.current.totalRevenue.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          color="primary"
        />
        <Card
          icon={ShoppingBag}
          label="Product Revenue"
          value={`৳${data.current.productRevenue.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          subtitle={`${data.current.productOrders} orders`}
          color="success"
        />
        <Card
          icon={Wallet}
          label="Top-Up Revenue"
          value={`৳${data.current.topUpRevenue.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          subtitle={`${data.current.topUpCount} top-ups`}
          color="accent"
        />
        <Card
          icon={TrendingUp}
          label="Previous Period"
          value={`৳${data.previous.totalRevenue.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          color="muted"
        />
      </div>
    </div>
  );
}

function Card({
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
  color: "primary" | "success" | "accent" | "muted";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    accent: "bg-accent/10 text-accent",
    muted: "bg-bg-secondary text-text-muted",
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