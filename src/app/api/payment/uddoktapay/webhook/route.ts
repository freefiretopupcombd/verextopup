import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  verifyIpnApiKey,
  verifyPayment,
} from "@/modules/payments/gateways/uddoktapay";

// ==================================================
// WEBHOOK (IPN) — Handle server-to-server notification
// ==================================================
// This is the MOST reliable way to confirm payment.
// Success redirect may fail, but webhook will always fire.
// ==================================================
export async function POST(request: NextRequest) {
  // ---- Verify API key signature ----
  const ipnKey = request.headers.get("RT-UDDOKTAPAY-API-KEY");

  if (!verifyIpnApiKey(ipnKey)) {
    console.error("UddoktaPay webhook: Invalid API key");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const invoiceId = body?.invoice_id;
  if (!invoiceId) {
    return NextResponse.json(
      { error: "Missing invoice_id" },
      { status: 400 }
    );
  }

  // ---- Idempotency check ----
  const existing = await prisma.paymentWebhook.findUnique({
    where: { eventId: `uddoktapay-${invoiceId}` },
  });

  if (existing?.processed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // ---- Log webhook ----
  await prisma.paymentWebhook.upsert({
    where: { eventId: `uddoktapay-${invoiceId}` },
    update: { processed: true, processedAt: new Date() },
    create: {
      provider: "uddoktapay",
      eventId: `uddoktapay-${invoiceId}`,
      payload: body,
      processed: true,
      processedAt: new Date(),
    },
  });

  // ---- Server-to-server verification ----
  try {
    const verification = await verifyPayment(invoiceId);

    if (verification.status !== "COMPLETED") {
      return NextResponse.json({ received: true, status: verification.status });
    }

    // ---- Find and update order (same logic as success route) ----
    const order = await prisma.order.findFirst({
      where: {
        paymentMethodSnapshot: {
          path: ["invoiceId"],
          equals: invoiceId,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ received: true, error: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // ---- Amount verification ----
    const paidAmount = parseFloat(verification.amount);
    const orderAmount = Number(order.totalAmount);

    if (Math.abs(paidAmount - orderAmount) > 0.01) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "ON_HOLD",
          internalNote: `Amount mismatch via webhook: paid ${paidAmount}, expected ${orderAmount}`,
        },
      });
      return NextResponse.json({ received: true, amountMismatch: true });
    }

    // ---- Mark paid ----
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING",
          paidAt: new Date(),
        },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          amount: orderAmount,
          currency: order.currency,
          status: "PAID",
          transactionId: verification.transaction_id,
          senderNumber: verification.sender_number,
          gatewayResponse: verification as any,
          submittedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ received: true, success: true });
  } catch (error) {
    console.error("UddoktaPay webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}