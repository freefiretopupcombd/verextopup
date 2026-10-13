import type { Metadata } from "next";
import Link from "next/link";
import { Plus, CreditCard, Zap } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PaymentTable } from "@/modules/payments/components/payment-table";
import { GatewayList } from "@/modules/payments/components/admin/gateway-list";

export const metadata: Metadata = {
  title: "Payment Methods — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage() {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-8">
      {/* ============================================
          SECTION 1: AUTOMATIC GATEWAYS
          ============================================ */}
      <div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Payment Gateways
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Automatic payment gateway চালু/বন্ধ করুন — এক API তে অনেক payment
              option
            </p>
          </div>
        </div>

        <GatewayList />
      </div>

      {/* ============================================
          DIVIDER
          ============================================ */}
      <div className="border-t border-border" />

      {/* ============================================
          SECTION 2: MANUAL PAYMENT METHODS
          ============================================ */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Manual Payment Methods
            </h2>
            <p className="text-text-muted text-sm mt-1">
              মোট {methods.length} টা method
            </p>
          </div>
          <Link
            href="/admin/payments/new"
            className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            নতুন Payment Method
          </Link>
        </div>

        {methods.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">
              এখনো কোনো payment method নেই
            </h2>
            <p className="text-text-muted text-sm mb-6">
              প্রথম payment method তৈরি করুন — যেমন bKash, Nagad
            </p>
            <Link
              href="/admin/payments/new"
              className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              প্রথম Payment Method তৈরি করুন
            </Link>
          </div>
        ) : (
          <PaymentTable
            methods={methods.map((m) => ({
              id: m.id,
              name: m.name,
              slug: m.slug,
              type: m.type,
              logo: m.logo,
              status: m.status,
              sortOrder: m.sortOrder,
              accountNumber: m.accountNumber,
              requireTxnId: m.requireTxnId,
              _count: { orders: m._count.orders },
            }))}
          />
        )}
      </div>
    </div>
  );
}