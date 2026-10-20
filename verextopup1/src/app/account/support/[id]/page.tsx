import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getUserTicketDetail } from "@/modules/support/queries";
import { TicketView } from "@/modules/support/components/ticket-view";

export const metadata: Metadata = {
  title: "Ticket — VerexTopUp",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const { id } = await params;
  const ticket = await getUserTicketDetail(id, userId);

  if (!ticket) notFound();

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
      </div>

      <TicketView ticket={ticket} />
    </div>
  );
}