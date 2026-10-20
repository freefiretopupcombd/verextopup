import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Package,
  CreditCard,
  Smartphone,
  Hash,
  ShoppingBag,
  Star,
  XCircle,
} from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getOrderByNumber } from "@/modules/orders/queries";
import { getEligibleOrdersForReview } from "@/modules/reviews/queries";
import { ReviewFormButton } from "@/modules/reviews/components/review-form-button";
import { DualPrice } from "@/modules/currency/components/dual-price";

export const metadata: Metadata = {
  title: "Order Details",
  robots: {
    index: false,
    follow: false,
  },
};

// ==================================================
// STATUS CONFIG — dynamic UI based on order status
// ==================================================
type StatusConfig = {
  icon: "check" | "clock" | "package" | "x";
  iconBg: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeClass: string;
  infoMessage: string;
  infoClass: string;
};

function getStatusConfig(status: string): StatusConfig {
  // ---- COMPLETED ----
  if (status === "COMPLETED") {
    return {
      icon: "check",
      iconBg: "bg-success/15 text-success",
      title: "Order Complete!",
      subtitle:
        "আপনার order সফলভাবে সম্পন্ন হয়েছে। ধন্যবাদ আমাদের সাথে থাকার জন্য!",
      badgeText: "COMPLETED",
      badgeClass: "bg-success/15 text-success",
      infoMessage:
        "✅ আপনার order সম্পন্ন হয়েছে। নিচে review দিতে পারেন — আপনার মতামত অন্য customer-দের সাহায্য করবে।",
      infoClass: "bg-success/5 border-success/20",
    };
  }

  // ---- PROCESSING ----
  if (status === "PROCESSING") {
    return {
      icon: "package",
      iconBg: "bg-primary/15 text-primary",
      title: "Order Confirmed!",
      subtitle:
        "আপনার payment সফল হয়েছে। Order process করা হচ্ছে — খুব শীঘ্রই delivery পাবেন।",
      badgeText: "PROCESSING",
      badgeClass: "bg-primary/15 text-primary",
      infoMessage:
        "📦 আপনার order process করা হচ্ছে। সাধারণত ১-৫ মিনিটের মধ্যে delivery হয়।",
      infoClass: "bg-primary/5 border-primary/20",
    };
  }

  // ---- AWAITING VERIFICATION ----
  if (status === "AWAITING_VERIFICATION") {
    return {
      icon: "clock",
      iconBg: "bg-warning/15 text-warning",
      title: "Payment Submitted!",
      subtitle:
        "আপনার payment verify করা হচ্ছে। Admin verify করলে order process শুরু হবে (সাধারণত ৫-৩০ মিনিট)।",
      badgeText: "AWAITING VERIFICATION",
      badgeClass: "bg-warning/15 text-warning",
      infoMessage:
        "⏱️ Admin আপনার payment verify করবে। Verify হলে order process শুরু হবে। সাধারণত ৫-৩০ মিনিট সময় লাগে।",
      infoClass: "bg-warning/5 border-warning/20",
    };
  }

  // ---- PENDING PAYMENT ----
  if (status === "PENDING_PAYMENT") {
    return {
      icon: "clock",
      iconBg: "bg-warning/15 text-warning",
      title: "Payment Pending",
      subtitle:
        "আপনার payment এখনো submit হয়নি। Order confirm করতে payment সম্পন্ন করুন।",
      badgeText: "PENDING PAYMENT",
      badgeClass: "bg-warning/15 text-warning",
      infoMessage:
        "💳 Payment সম্পন্ন করুন — payment ছাড়া order process হবে না।",
      infoClass: "bg-warning/5 border-warning/20",
    };
  }

  // ---- CANCELLED ----
  if (status === "CANCELLED") {
    return {
      icon: "x",
      iconBg: "bg-danger/15 text-danger",
      title: "Order Cancelled",
      subtitle:
        "দুঃখিত, আপনার order টি বাতিল করা হয়েছে। বিস্তারিত জানতে support এ যোগাযোগ করুন।",
      badgeText: "CANCELLED",
      badgeClass: "bg-danger/15 text-danger",
      infoMessage:
        "❌ Order বাতিল হয়েছে। কোনো প্রশ্ন থাকলে support এ যোগাযোগ করুন।",
      infoClass: "bg-danger/5 border-danger/20",
    };
  }

  // ---- FAILED ----
  if (status === "FAILED") {
    return {
      icon: "x",
      iconBg: "bg-danger/15 text-danger",
      title: "Order Failed",
      subtitle:
        "দুঃখিত, order টি fail হয়েছে। আবার চেষ্টা করুন অথবা support এ যোগাযোগ করুন।",
      badgeText: "FAILED",
      badgeClass: "bg-danger/15 text-danger",
      infoMessage:
        "❌ Order fail হয়েছে। আবার চেষ্টা করুন অথবা support এ যোগাযোগ করুন।",
      infoClass: "bg-danger/5 border-danger/20",
    };
  }

  // ---- DEFAULT (unknown status) ----
  return {
    icon: "clock",
    iconBg: "bg-primary/15 text-primary",
    title: "Order Received",
    subtitle: "আপনার order সফলভাবে তৈরি হয়েছে।",
    badgeText: status.replace(/_/g, " "),
    badgeClass: "bg-primary/15 text-primary",
    infoMessage: "আপনার order প্রক্রিয়াধীন।",
    infoClass: "bg-primary/5 border-primary/20",
  };
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { orderNumber } = await params;
  const userId = (session.user as any).id as string;

  const order = await getOrderByNumber(orderNumber, userId);
  if (!order) notFound();

  const eligibleOrders = await getEligibleOrdersForReview(userId);

  const isPaid = order.paymentStatus === "PAID";
  const isAwaitingVerification = order.status === "AWAITING_VERIFICATION";
  const isCompleted = order.status === "COMPLETED";

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ============================================
          STATUS BANNER (dynamic)
      ============================================ */}
      <div className="text-center mb-8">
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${statusConfig.iconBg}`}
        >
          {statusConfig.icon === "check" && (
            <CheckCircle2 className="w-10 h-10" />
          )}
          {statusConfig.icon === "clock" && <Clock className="w-10 h-10" />}
          {statusConfig.icon === "package" && <Package className="w-10 h-10" />}
          {statusConfig.icon === "x" && <XCircle className="w-10 h-10" />}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          {statusConfig.title}
        </h1>
        <p className="text-text-muted mt-2 text-sm sm:text-base max-w-md mx-auto">
          {statusConfig.subtitle}
        </p>

        <div className="inline-flex items-center gap-2 bg-bg-card border border-border rounded-lg px-4 py-2 mt-4">
          <span className="text-xs text-text-muted">Order:</span>
          <span className="font-mono font-bold text-primary text-sm">
            {order.orderNumber}
          </span>
        </div>
      </div>

      {/* ============================================
          ORDER INFO
      ============================================ */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-text-muted mb-1">Date</div>
            <div className="font-medium text-text-primary">
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Status</div>
            <div
              className={`font-medium text-xs px-2 py-0.5 rounded inline-block ${statusConfig.badgeClass}`}
            >
              {statusConfig.badgeText}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Payment</div>
            <div
              className={`font-medium ${
                isPaid ? "text-success" : "text-warning"
              }`}
            >
              {order.paymentStatus}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          PRODUCT SUMMARY
      ============================================ */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-text-primary text-sm">
            Product Summary
          </h2>
        </div>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
            >
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/15 to-bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                {item.product?.thumbnail ? (
                  <img
                    src={item.product.thumbnail}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : item.product?.icon ? (
                  <span className="text-2xl">{item.product.icon}</span>
                ) : (
                  <span className="text-2xl">🎮</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-primary text-sm">
                  {item.productName}
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {item.variantName} × {item.quantity}
                </div>

                {item.fields.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.fields.map((f, i) => (
                      <div
                        key={i}
                        className="flex justify-between gap-2 text-xs"
                      >
                        <span className="text-text-muted">
                          {f.fieldLabel}:
                        </span>
                        <span className="text-text-primary font-mono">
                          {f.fieldValue}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2">
                  <DualPrice
                    amountBDT={item.totalPrice}
                    size="sm"
                    layout="stacked"
                    primaryClassName="text-text-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-border flex justify-between items-baseline">
          <span className="font-semibold text-text-primary">Total</span>
          <DualPrice
            amountBDT={order.totalAmount}
            size="lg"
            layout="stacked"
            primaryClassName="text-primary"
          />
        </div>
      </div>

      {/* ============================================
          WRITE REVIEW SECTION (only if completed)
      ============================================ */}
      {isCompleted && (
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-warning" />
            <h2 className="font-bold text-text-primary text-sm">
              Write a Review
            </h2>
          </div>

          <p className="text-xs text-text-muted mb-4">
            আপনার purchase-এর অভিজ্ঞতা শেয়ার করুন — অন্য customer-দের সাহায্য
            করবে।
          </p>

          <div className="space-y-3">
            {order.items.map((item) => {
              if (!item.productSlug) return null;

              const alreadyReviewed = !eligibleOrders.some(
                (e) =>
                  e.orderId === order.id &&
                  e.product.id === (item as any).productId
              );

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : item.icon ? (
                      <span className="text-xl">{item.icon}</span>
                    ) : (
                      <span className="text-xl">🎮</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {item.productName}
                    </div>
                    <div className="text-xs text-text-muted">
                      {item.variantName}
                    </div>
                  </div>

                  {alreadyReviewed ? (
                    <span className="text-[10px] text-success bg-success/10 px-2 py-1 rounded font-medium shrink-0">
                      ✓ Reviewed
                    </span>
                  ) : (
                    <ReviewFormButton
                      productId={(item as any).productId || ""}
                      orderId={order.id}
                      productName={item.productName}
                      variantName={item.variantName}
                      productThumbnail={item.thumbnail}
                      productIcon={item.icon}
                      existingReview={null}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================
          PAYMENT INFO
      ============================================ */}
      {order.paymentMethod && (
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-text-primary text-sm">
              Payment Information
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Method</span>
              <span className="font-medium text-text-primary">
                {order.paymentMethod.name}
              </span>
            </div>

            {order.paymentSubmission?.senderNumber && (
              <div className="flex justify-between items-center text-sm gap-2">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Sender Number</span>
                </div>
                <span className="font-mono text-text-primary text-xs">
                  {order.paymentSubmission.senderNumber}
                </span>
              </div>
            )}

            {order.paymentSubmission?.transactionId && (
              <div className="flex justify-between items-center text-sm gap-2">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Transaction ID</span>
                </div>
                <span className="font-mono text-text-primary text-xs truncate max-w-[200px]">
                  {order.paymentSubmission.transactionId}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-text-muted">Status</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  isPaid
                    ? "bg-success/15 text-success"
                    : "bg-warning/15 text-warning"
                }`}
              >
                {isPaid ? "PAID" : "UNDER REVIEW"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          INFO MESSAGE (dynamic)
      ============================================ */}
      <div
        className={`rounded-xl p-4 mb-6 border ${statusConfig.infoClass}`}
      >
        <p className="text-xs text-text-secondary leading-relaxed">
          {statusConfig.infoMessage}
        </p>
      </div>

      {/* ============================================
          ACTIONS
      ============================================ */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center gap-2 bg-bg-card border border-border hover:border-primary text-text-primary font-medium px-6 py-3 rounded-lg transition"
        >
          My Orders
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}