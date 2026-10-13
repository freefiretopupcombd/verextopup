import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { getUserDetail } from "@/modules/users/admin/queries";
import { UserDetailHeader } from "@/modules/users/admin/components/user-detail-header";
import { UserStats } from "@/modules/users/admin/components/user-stats";
import { UserTabs } from "@/modules/users/admin/components/tabs/user-tabs";
import { OverviewTab } from "@/modules/users/admin/components/tabs/overview-tab";
import { WalletTab } from "@/modules/users/admin/components/tabs/wallet-tab";
import { OrdersTab } from "@/modules/users/admin/components/tabs/orders-tab";
import { ReviewsTab } from "@/modules/users/admin/components/tabs/reviews-tab";
import { SecurityTab } from "@/modules/users/admin/components/tabs/security-tab";

export const metadata: Metadata = {
  title: "User Detail — Admin",
};

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { userId } = await params;
  const search = await searchParams;

  const [session, user] = await Promise.all([
    getSession(),
    getUserDetail(userId),
  ]);

  if (!user) notFound();

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";
  const isSelf = (session?.user as any)?.id === userId;
  const tab = search.tab || "overview";

  return (
    <div className="space-y-5">
      {/* Header with actions */}
      <UserDetailHeader
        user={{
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          name: user.name,
          phone: user.phone,
          image: user.image,
          role: user.role,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          wallet: user.wallet
            ? {
                id: user.wallet.id,
                balance: user.wallet.balance,
                currency: user.wallet.currency,
                status: user.wallet.status,
              }
            : null,
        }}
        isSuperAdmin={isSuperAdmin}
        isSelf={isSelf}
      />

      {/* Stats */}
      <UserStats
        orderCount={user.stats.orderCount}
        orderTotal={user.stats.orderTotal}
        reviewCount={user.stats.reviewCount}
        ticketCount={user.stats.ticketCount}
        walletBalance={user.wallet?.balance || 0}
      />

      {/* Tabs */}
      <UserTabs />

      {/* Tab content */}
      {tab === "overview" && <OverviewTab user={user} />}
      {tab === "wallet" && <WalletTab userId={user.id} wallet={user.wallet} />}
      {tab === "orders" && <OrdersTab orders={user.recentOrders} />}
      {tab === "reviews" && <ReviewsTab reviews={user.recentReviews} />}
      {tab === "security" && (
        <SecurityTab
          user={{
            email: user.email,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
            lastLoginAt: user.lastLoginAt,
            lastLoginIp: user.lastLoginIp,
            createdAt: user.createdAt,
            status: user.status,
          }}
        />
      )}
    </div>
  );
}