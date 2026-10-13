"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";

export function WalletAnalyticsSection({
  data,
}: {
  data: {
    totalBalance: number;
    credited: { amount: number; count: number };
    debited: { amount: number; count: number };
    pendingTopUps: { amount: number; count: number };
    dailyChart: { date: string; credits: number; debits: number }[];
  };
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
        Wallet Analytics
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Mini
          icon={Wallet}
          label="Total Balance"
          value={`৳${data.totalBalance.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          color="primary"
        />
        <Mini
          icon={TrendingUp}
          label="Credited"
          value={`৳${data.credited.amount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          subtitle={`${data.credited.count} txns`}
          color="success"
        />
        <Mini
          icon={TrendingDown}
          label="Debited"
          value={`৳${data.debited.amount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`}
          subtitle={`${data.debited.count} txns`}
          color="danger"
        />
        <Mini
          icon={Clock}
          label="Pending Top-Ups"
          value={data.pendingTopUps.count.toString()}
          subtitle={`৳${data.pendingTopUps.amount.toFixed(2)}`}
          color="warning"
        />
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-text-primary mb-4">
          Wallet Flow (Credits vs Debits)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.dailyChart}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#888", fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
                stroke="#2a2a3a"
              />
              <YAxis
                tick={{ fill: "#888", fontSize: 11 }}
                stroke="#2a2a3a"
                tickFormatter={(v) => `৳${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a24",
                  border: "1px solid #2a2a3a",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: any, name: any) => [`৳${Number(v).toFixed(2)}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="credits" name="Credits" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="debits" name="Debits" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Mini({
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
      <div className="text-lg font-bold text-text-primary mt-0.5 truncate">
        {value}
      </div>
      {subtitle && (
        <div className="text-[10px] text-text-muted mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}