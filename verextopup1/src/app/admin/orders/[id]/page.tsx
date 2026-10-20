import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getOrderById } from "@/modules/orders/admin/queries";
import { AdminOrderView } from "@/modules/orders/admin/components/admin-order-view";

export const metadata: Metadata = {
  title: "Order Details — Admin",
};

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Orders-এ ফিরুন
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-text-primary">
            Order Details
          </h1>
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
            {order.orderNumber}
          </span>
        </div>
      </div>

      <AdminOrderView order={order} />
    </div>
  );
}