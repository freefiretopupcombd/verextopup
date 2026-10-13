import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PaymentForm } from "@/modules/payments/components/payment-form";

export const metadata: Metadata = {
  title: "Edit Payment Method — Admin",
};

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Payment Methods-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          Payment Method Edit
        </h1>
        <p className="text-text-muted text-sm mt-1 font-mono">
          /{method.slug}
        </p>
      </div>

      <PaymentForm
        mode="edit"
        paymentId={method.id}
        initialData={{
          name: method.name,
          slug: method.slug,
          type: method.type,
          logo: method.logo,
          accountNumber: method.accountNumber,
          merchantNumber: method.merchantNumber,
          instructions: method.instructions,
          requireTxnId: method.requireTxnId,
          requireScreenshot: method.requireScreenshot,
          minAmount: method.minAmount ? Number(method.minAmount) : null,
          maxAmount: method.maxAmount ? Number(method.maxAmount) : null,
          status: method.status,
          sortOrder: method.sortOrder,
          inputFields: Array.isArray(method.inputFields)
            ? (method.inputFields as any[])
            : [],
        }}
      />
    </div>
  );
}