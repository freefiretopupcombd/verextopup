import type { Metadata } from "next";

import { auth } from "@/lib/auth/auth";
import { getWalletData } from "@/modules/wallet/queries";
import { WalletView } from "@/modules/wallet/components/wallet-view";

export const metadata: Metadata = {
  title: "Wallet — VerexTopUp",
};

export default async function WalletPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const data = await getWalletData(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          আমার Wallet
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Balance, transactions এবং top-up history
        </p>
      </div>

      <WalletView
        balance={data.balance}
        transactions={data.transactions}
        topUps={data.topUps}
      />
    </div>
  );
}