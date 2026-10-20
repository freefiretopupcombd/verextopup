import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getTicketDetailAdmin } from "@/modules/support/queries";
import { AdminTicketView } from "@/modules/support/admin/components/admin-ticket-view";

export const metadata: Metadata = {
  title: "Ticket Details — Admin",
};

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicketDetailAdmin(id);

  if (!ticket) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Support-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          Ticket Details
        </h1>
      </div>

      <AdminTicketView ticket={ticket} />
    </div>
  );
}