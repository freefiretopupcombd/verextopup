import type { Metadata } from "next";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard — VerexTopUp",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  const [orderCount, userCount, productCount, categoryCount] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Admin Dashboard</h1>
        <p className="text-content-muted text-sm mt-1">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orderCount} />
        <StatCard label="Revenue" value="৳0" />
        <StatCard label="Users" value={userCount} />
        <StatCard label="Categories" value={categoryCount} />
      </div>

      {/* Placeholder */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <h2 className="text-lg font-bold text-content mb-4">Coming Soon</h2>
        <ul className="space-y-2 text-content-muted text-sm">
          <li>• Product management</li>
          <li>• Order management</li>
          <li>• Payment methods</li>
          <li>• Wallet management</li>
          <li>• Reviews</li>
          <li>• Settings</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border p-5">
      <div className="text-content-muted text-sm">{label}</div>
      <div className="text-2xl font-bold text-content mt-2">{value}</div>
    </div>
  );
}