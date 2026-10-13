import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getUserRecentOrders } from "@/modules/support/queries";
import { CreateTicketForm } from "@/modules/support/components/create-ticket-form";

export const metadata: Metadata = {
  title: "New Ticket — VerexTopUp",
};

export default async function NewTicketPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;
  const orders = await getUserRecentOrders(userId);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/account/support"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Support-এ ফিরুন
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          নতুন Ticket
        </h1>
        <p className="text-sm text-text-muted mt-1">
          আপনার সমস্যা বিস্তারিত লিখুন
        </p>
      </div>

      <CreateTicketForm orders={orders} />
    </div>
  );
}