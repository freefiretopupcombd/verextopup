import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Ban,
  Activity,
} from "lucide-react";

export function WalletStats({
  stats,
}: {
  stats: {
    totalWallets: number;
    totalBalance: number;
    totalCredited: number;
    totalDebited: number;
    todayCredited: number;
    todayDebited: number;
    weekCredited: number;
    monthCredited: number;
    pendingTopUps: number;
    frozenWallets: number;
    todayTxnCount: number;
  };
}) {
  return (
    <div className="space-y-3">
      {/* Top row: main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Wallet}
          label="Total Balance"
          value={`৳${stats.totalBalance.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          subtitle={`${stats.totalWallets} wallets`}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Credited"
          value={`৳${stats.totalCredited.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          subtitle="All time"
          color="success"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Debited"
          value={`৳${stats.totalDebited.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          subtitle="All time"
          color="danger"
        />
        <StatCard
          icon={Clock}
          label="Pending Top-Ups"
          value={stats.pendingTopUps.toString()}
          subtitle="Waiting approval"
          color="warning"
        />
      </div>

      {/* Bottom row: secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat
          icon={TrendingUp}
          label="Today Credited"
          value={`৳${stats.todayCredited.toFixed(2)}`}
          color="success"
        />
        <MiniStat
          icon={TrendingDown}
          label="Today Debited"
          value={`৳${stats.todayDebited.toFixed(2)}`}
          color="danger"
        />
        <MiniStat
          icon={Activity}
          label="Today Transactions"
          value={stats.todayTxnCount.toString()}
          color="primary"
        />
        <MiniStat
          icon={Ban}
          label="Frozen Wallets"
          value={stats.frozenWallets.toString()}
          color="warning"
        />
      </div>
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
  color: "primary" | "success" | "danger" | "warning";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/10 text-warning",
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
      <div className="text-lg sm:text-xl font-bold text-text-primary mt-0.5 truncate">
        {value}
      </div>
      {subtitle && (
        <div className="text-[10px] text-text-muted mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: "primary" | "success" | "danger" | "warning";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          {label}
        </div>
        <div className="text-sm font-bold text-text-primary mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}