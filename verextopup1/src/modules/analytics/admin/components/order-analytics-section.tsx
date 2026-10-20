"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ShoppingBag, CheckCircle2, Clock, XCircle } from "lucide-react";

const COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

export function OrderAnalyticsSection({
  data,
}: {
  data: {
    total: number;
    byStatus: { status: string; count: number }[];
    byPaymentStatus: { status: string; count: number }[];
  };
}) {
  const pieData = data.byStatus.map((s) => ({
    name: s.status,
    value: s.count,
  }));

  const completed = data.byStatus.find((s) => s.status === "COMPLETED")?.count || 0;
  const pending = data.byStatus.find((s) => s.status === "PENDING_PAYMENT")?.count || 0;
  const processing = data.byStatus.find((s) => s.status === "PROCESSING")?.count || 0;
  const failed = data.byStatus.find((s) => s.status === "CANCELLED")?.count || 0;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
        Order Analytics
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Mini
          icon={ShoppingBag}
          label="Total Orders"
          value={data.total}
          color="primary"
        />
        <Mini
          icon={CheckCircle2}
          label="Completed"
          value={completed}
          color="success"
        />
        <Mini icon={Clock} label="Pending" value={pending + processing} color="warning" />
        <Mini icon={XCircle} label="Cancelled" value={failed} color="danger" />
      </div>

      {pieData.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-text-primary mb-2">
            Order Status Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a24",
                    border: "1px solid #2a2a3a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: "primary" | "success" | "warning" | "danger";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
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
      <div className="text-xl font-bold text-text-primary mt-0.5">{value}</div>
    </div>
  );
}