import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getActivePaymentMethods } from "@/modules/wallet/actions";
import { RechargeView } from "@/modules/wallet/components/recharge-view";

export const metadata: Metadata = {
  title: "Recharge Wallet — VerexTopUp",
};

export default async function RechargePage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const [paymentMethods, wallet] = await Promise.all([
    getActivePaymentMethods(),
    prisma.wallet.findUnique({ where: { userId } }),
  ]);

  const currentBalance = wallet ? Number(wallet.balance) : 0;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/account/wallet"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Wallet-এ ফিরুন
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Recharge Wallet
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Amount এবং payment method select করুন
        </p>
      </div>

      <RechargeView
        paymentMethods={paymentMethods}
        currentBalance={currentBalance}
      />
    </div>
  );
}