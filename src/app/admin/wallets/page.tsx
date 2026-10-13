import type { Metadata } from "next";
import { Wallet as WalletIcon } from "lucide-react";

import {
  getWalletDashboardStats,
  listAllTransactions,
  listPendingTopUps,
} from "@/modules/wallet/admin/queries";
import { WalletStats } from "@/modules/wallet/admin/components/wallet-stats";
import { QuickActions } from "@/modules/wallet/admin/components/quick-actions";
import { RecentTransactions } from "@/modules/wallet/admin/components/recent-transactions";
import { PendingTopUpsWidget } from "@/modules/wallet/admin/components/pending-topups-widget";

export const metadata: Metadata = {
  title: "Wallet Management — Admin",
};

export default async function AdminWalletsPage() {
  const [stats, recentTxns, pendingTopUps] = await Promise.all([
    getWalletDashboardStats(),
    listAllTransactions({ page: 1, perPage: 8 }),
    listPendingTopUps({ page: 1, perPage: 5 }),
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <WalletIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Wallet Management
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            User wallet, balance, transactions — সব এক জায়গায়
          </p>
        </div>
      </div>

      {/* Stats */}
      <WalletStats stats={stats} />

      {/* Quick actions */}
      <QuickActions pendingCount={stats.pendingTopUps} />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTransactions transactions={recentTxns.transactions} />
        <PendingTopUpsWidget topUps={pendingTopUps.topUps} />
      </div>
    </div>
  );
}