"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { date: string; product: number; topUp: number; total: number }[];
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-bold text-text-primary mb-4">
        Revenue Trend
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
              labelStyle={{ color: "#fff" }}
              formatter={(v: any, name: any) => [`৳${Number(v).toFixed(2)}`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="product"
              name="Product"
              stroke="#7C3AED"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="topUp"
              name="Top-Up"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}