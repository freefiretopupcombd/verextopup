import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PaymentForm } from "@/modules/payments/components/payment-form";

export const metadata: Metadata = {
  title: "New Payment Method — Admin",
};

export default function NewPaymentPage() {
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
          নতুন Payment Method
        </h1>
      </div>

      <PaymentForm mode="create" />
    </div>
  );
}