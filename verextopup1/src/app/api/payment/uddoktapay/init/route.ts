import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { createCheckout } from "@/modules/payments/gateways/uddoktapay";

// ==================================================
// INIT — Create UddoktaPay checkout session
// ==================================================
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await request.json();

  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID required" },
      { status: 400 }
    );
  }

  // ---- Fetch order (server-side authoritative data) ----
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // ---- Verify ownership ----
  if (order.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ---- Verify order is not already paid ----
  if (order.paymentStatus === "PAID") {
    return NextResponse.json(
      { error: "Order already paid" },
      { status: 400 }
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const checkout = await createCheckout({
      full_name: order.user?.name || "Customer",
      email: order.user?.email || "customer@example.com",
      amount: Number(order.totalAmount).toFixed(2),
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        user_id: userId,
      },
      redirect_url: `${baseUrl}/api/payment/uddoktapay/success`,
      cancel_url: `${baseUrl}/api/payment/uddoktapay/cancel`,
      webhook_url: `${baseUrl}/api/payment/uddoktapay/webhook`,
    });

    if (!checkout.status || !checkout.payment_url) {
      return NextResponse.json(
        { error: checkout.message || "Checkout failed" },
        { status: 400 }
      );
    }

    // ---- Save invoice_id to order for tracking ----
    // We'll store this in paymentMethodSnapshot or a new field
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethodSnapshot: {
          ...(order.paymentMethodSnapshot as any),
          provider: "UDDOKTAPAY",
          invoiceId: checkout.payment_url.split("/").pop(),
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: checkout.payment_url,
    });
  } catch (error) {
    console.error("UddoktaPay init error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}