import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Wallet, Star, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My Account — VerexTopUp",
};

export default async function AccountOverviewPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  // Fetch fresh data
  const [user, wallet, orderCount, reviewCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true, createdAt: true },
    }),
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.order.count({ where: { userId } }),
    prisma.review.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-content">
          হ্যালো, {user?.name || "User"}! 👋
        </h1>
        <p className="text-content-muted mt-1">
          আপনার account-এর সবকিছু এখান থেকে দেখুন
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="মোট অর্ডার"
          value={String(orderCount)}
          href="/account/orders"
        />
        <StatCard
          icon={Wallet}
          label="Wallet Balance"
          value={`৳${Number(wallet?.balance || 0).toFixed(2)}`}
          href="/account/wallet"
        />
        <StatCard
          icon={Star}
          label="রিভিউ"
          value={String(reviewCount)}
          href="/account/reviews"
        />
      </div>

      {/* Account info */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <h2 className="text-lg font-bold text-content mb-4">
          Account Information
        </h2>
        <div className="space-y-3 text-sm">
          <InfoRow label="Email" value={user?.email || "-"} />
          <InfoRow
            label="Role"
            value={
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
                {user?.role || "CUSTOMER"}
              </span>
            }
          />
          <InfoRow
            label="Member Since"
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"
            }
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <h2 className="text-lg font-bold text-content mb-4">
          Quick Links
        </h2>
        <div className="space-y-2">
          <QuickLink href="/account/profile" label="প্রোফাইল update করুন" />
          <QuickLink
            href="/account/security"
            label="Password পরিবর্তন করুন"
          />
          <QuickLink href="/" label="নতুন top-up কিনুন" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: any;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-bg-card rounded-xl shadow-card border border-border p-5 hover:border-primary/50 transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-content-muted text-xs">{label}</div>
      <div className="text-2xl font-bold text-text-primary mt-1">{value}</div>
    </Link>
  );
}
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-content-muted">{label}</span>
      <span className="text-content font-medium">{value}</span>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition group"
    >
      <span className="text-content text-sm">{label}</span>
      <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-primary transition" />
    </Link>
  );
}