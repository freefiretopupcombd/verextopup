import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/modules/payments/gateways/uddoktapay";

// ==================================================
// Shared handler
// ==================================================
async function handleSuccess(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  let invoiceId: string | null = null;

  if (request.method === "GET") {
    invoiceId = request.nextUrl.searchParams.get("invoice_id");
  } else {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.json();
        invoiceId = body.invoice_id || null;
      } else {
        const formData = await request.formData();
        invoiceId = (formData.get("invoice_id") as string) || null;
      }
    } catch (error) {
      console.error("[UDDOKTAPAY SUCCESS] Body parse error:", error);
    }
  }

  console.log("[UDDOKTAPAY SUCCESS] Method:", request.method);
  console.log("[UDDOKTAPAY SUCCESS] invoice_id:", invoiceId);

  // ---- No invoice_id → error page ----
  if (!invoiceId) {
    return htmlResponse({
      title: "Payment Error",
      message: "Invalid payment reference",
      redirectUrl: `${baseUrl}/account/orders`,
    });
  }

  try {
    // ---- Verify payment ----
    const verification = await verifyPayment(invoiceId);

    console.log("[UDDOKTAPAY SUCCESS] Verification:", {
      status: verification.status,
      amount: verification.amount,
      transactionId: verification.transaction_id,
      metadata: verification.metadata,
    });

    if (verification.status !== "COMPLETED") {
      return htmlResponse({
        title: "Payment Pending",
        message: `Payment status: ${verification.status}. Please check your orders.`,
        redirectUrl: `${baseUrl}/account/orders`,
      });
    }

    // ---- Find order via metadata ----
    const orderIdFromMetadata = verification.metadata?.order_id;

    if (!orderIdFromMetadata) {
      return htmlResponse({
        title: "Order Not Found",
        message: "Could not match payment to an order",
        redirectUrl: `${baseUrl}/account/orders`,
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderIdFromMetadata },
    });

    if (!order) {
      return htmlResponse({
        title: "Order Not Found",
        message: "Order does not exist",
        redirectUrl: `${baseUrl}/account/orders`,
      });
    }

    console.log("[UDDOKTAPAY SUCCESS] Order found:", order.orderNumber);

    // ---- Already paid (idempotent) ----
    if (order.paymentStatus === "PAID") {
      console.log("[UDDOKTAPAY SUCCESS] Already paid, redirecting");
      return htmlResponse({
        title: "Payment Successful",
        message: `Order ${order.orderNumber} is already paid`,
        redirectUrl: `${baseUrl}/order/${order.orderNumber}`,
      });
    }

    // ---- Amount verification ----
    const paidAmount = parseFloat(verification.amount);
    const orderAmount = Number(order.totalAmount);

    if (Math.abs(paidAmount - orderAmount) > 0.01) {
      console.error("[UDDOKTAPAY SUCCESS] Amount mismatch:", {
        paidAmount,
        orderAmount,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "ON_HOLD",
          internalNote: `Amount mismatch: paid ${paidAmount}, expected ${orderAmount}`,
        },
      });

      return htmlResponse({
        title: "Payment Verification Pending",
        message:
          "Your payment is being verified manually. We'll contact you shortly.",
        redirectUrl: `${baseUrl}/account/orders`,
      });
    }

    // ---- Mark order as PAID ----
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING",
          paidAt: new Date(),
        },
      });

      const existingTxn = await tx.paymentTransaction.findFirst({
        where: { orderId: order.id },
      });

      if (!existingTxn) {
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
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "PAID",
          note: `UddoktaPay: ${verification.payment_method} - ${verification.transaction_id}`,
          changedBy: "system",
        },
      });
    });

    console.log("[UDDOKTAPAY SUCCESS] Order marked PAID:", order.orderNumber);

    // ---- Return HTML with redirect ----
    return htmlResponse({
      title: "Payment Successful! 🎉",
      message: `Order ${order.orderNumber} has been confirmed`,
      redirectUrl: `${baseUrl}/order/${order.orderNumber}`,
    });
  } catch (error: any) {
    console.error("[UDDOKTAPAY SUCCESS] Error:", error);
    return htmlResponse({
      title: "Payment Error",
      message: "Something went wrong. Please check your orders.",
      redirectUrl: `${baseUrl}/account/orders`,
    });
  }
}

// ==================================================
// HTML RESPONSE HELPER
// ==================================================
// Returns a branded HTML page that auto-redirects.
// This works for BOTH GET (browser) and POST (UddoktaPay callback).
// ==================================================
function htmlResponse({
  title,
  message,
  redirectUrl,
}: {
  title: string;
  message: string;
  redirectUrl: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="2;url=${redirectUrl}">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0e1a;
      color: #e8e9f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 480px;
      width: 100%;
      background: #14192b;
      border: 1px solid #2a3148;
      border-radius: 16px;
      padding: 40px 30px;
      text-align: center;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #2a3148;
      border-top-color: #7c3aed;
      border-radius: 50%;
      margin: 0 auto 20px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #e8e9f0;
    }
    p {
      font-size: 14px;
      color: #8a90a8;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    a {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed, #6366f1);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    a:hover { opacity: 0.9; }
    .small {
      font-size: 12px;
      color: #5a6078;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${redirectUrl}">Continue →</a>
    <p class="small">Auto-redirecting in 2 seconds...</p>
  </div>
  <script>
    setTimeout(function() {
      window.location.href = "${redirectUrl}";
    }, 2000);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// ==================================================
// GET — browser redirect
// ==================================================
export async function GET(request: NextRequest) {
  return handleSuccess(request);
}

// ==================================================
// POST — UddoktaPay server callback
// ==================================================
export async function POST(request: NextRequest) {
  return handleSuccess(request);
}