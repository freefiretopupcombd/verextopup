import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const topUp = await prisma.walletTopUp.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      paymentMethod: { select: { id: true, name: true, slug: true } },
      fields: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!topUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: topUp.id,
    referenceNumber: topUp.referenceNumber,
    amount: Number(topUp.amount),
    currency: topUp.currency,
    status: topUp.status,
    senderNumber: topUp.senderNumber,
    transactionId: topUp.transactionId,
    screenshotUrl: topUp.screenshotUrl,
    customerNote: topUp.customerNote,
    adminNote: topUp.adminNote,
    rejectionReason: topUp.rejectionReason,
    createdAt: topUp.createdAt.toISOString(),
    verifiedAt: topUp.verifiedAt?.toISOString() || null,
    customer: topUp.user,
    paymentMethod: topUp.paymentMethod,
    paymentMethodSnapshot: topUp.paymentMethodSnapshot,

    // ✅ All submitted fields (dynamic)
    fields: topUp.fields.map((f) => ({
      id: f.id,
      name: f.fieldName,
      label: f.fieldLabel,
      value: f.fieldValue,
      role: f.fieldRole,
    })),
  });
}