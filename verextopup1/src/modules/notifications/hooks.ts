"use server";

import { notifyUser } from "./service";

// ==================================================
// ORDER PLACED
// ==================================================
export async function notifyOrderPlaced(
  userId: string,
  orderNumber: string
) {
  await notifyUser(
    userId,
    "ORDER_PLACED",
    "🎉 Order Placed Successfully",
    `আপনার order #${orderNumber} সফলভাবে তৈরি হয়েছে।`,
    `/order/${orderNumber}`,
    { orderNumber }
  );
}

// ==================================================
// ORDER COMPLETED
// ==================================================
export async function notifyOrderCompleted(
  userId: string,
  orderNumber: string
) {
  await notifyUser(
    userId,
    "ORDER_COMPLETED",
    "✅ Order Completed",
    `আপনার order #${orderNumber} সম্পন্ন হয়েছে!`,
    `/order/${orderNumber}`,
    { orderNumber }
  );
}

// ==================================================
// PAYMENT VERIFIED
// ==================================================
export async function notifyPaymentVerified(
  userId: string,
  orderNumber: string
) {
  await notifyUser(
    userId,
    "PAYMENT_VERIFIED",
    "💳 Payment Verified",
    `আপনার payment verify হয়েছে। Order #${orderNumber} process করা হচ্ছে।`,
    `/order/${orderNumber}`,
    { orderNumber }
  );
}

// ==================================================
// PAYMENT REJECTED
// ==================================================
export async function notifyPaymentRejected(
  userId: string,
  orderNumber: string,
  reason: string
) {
  await notifyUser(
    userId,
    "PAYMENT_REJECTED",
    "❌ Payment Rejected",
    `আপনার payment reject হয়েছে: ${reason}`,
    `/order/${orderNumber}`,
    { orderNumber, reason }
  );
}

// ==================================================
// WALLET CREDITED
// ==================================================
export async function notifyWalletCredited(
  userId: string,
  amount: number,
  reason: string
) {
  await notifyUser(
    userId,
    "WALLET_CREDITED",
    "💰 Wallet Credited",
    `আপনার wallet-এ ৳${amount.toFixed(2)} যোগ হয়েছে। ${reason}`,
    "/account/wallet",
    { amount, reason }
  );
}

// ==================================================
// WALLET DEBITED
// ==================================================
export async function notifyWalletDebited(
  userId: string,
  amount: number,
  reason: string
) {
  await notifyUser(
    userId,
    "WALLET_DEBITED",
    "💸 Wallet Debited",
    `আপনার wallet থেকে ৳${amount.toFixed(2)} কাটা হয়েছে। ${reason}`,
    "/account/wallet",
    { amount, reason }
  );
}

// ==================================================
// TOPUP APPROVED
// ==================================================
export async function notifyTopUpApproved(
  userId: string,
  amount: number,
  reference: string
) {
  await notifyUser(
    userId,
    "TOPUP_APPROVED",
    "✅ Top-Up Approved",
    `আপনার ৳${amount.toFixed(2)} top-up approve হয়েছে। Reference: ${reference}`,
    "/account/wallet",
    { amount, reference }
  );
}

// ==================================================
// TOPUP REJECTED
// ==================================================
export async function notifyTopUpRejected(
  userId: string,
  amount: number,
  reason: string
) {
  await notifyUser(
    userId,
    "TOPUP_REJECTED",
    "❌ Top-Up Rejected",
    `আপনার ৳${amount.toFixed(2)} top-up reject হয়েছে: ${reason}`,
    "/account/wallet",
    { amount, reason }
  );
}

// ==================================================
// TICKET REPLY
// ==================================================
export async function notifyTicketReply(
  userId: string,
  ticketId: string,
  ticketNo: string,
  subject: string
) {
  await notifyUser(
    userId,
    "TICKET_REPLY",
    "💬 Support Reply",
    `আপনার ticket #${ticketNo} (${subject})-এ নতুন reply এসেছে।`,
    `/account/support/${ticketId}`,
    { ticketId, ticketNo }
  );
}

// ==================================================
// WELCOME
// ==================================================
export async function notifyWelcome(userId: string, userName: string) {
  await notifyUser(
    userId,
    "WELCOME",
    `🎉 Welcome to VerexTopUp, ${userName || "Friend"}!`,
    "আপনার account তৈরি হয়েছে। এখন গেম top-up এবং subscription কিনতে পারবেন।",
    "/products",
    {}
  );
}

// ==================================================
// REVIEW APPROVED
// ==================================================
export async function notifyReviewApproved(
  userId: string,
  productSlug: string,
  productName: string
) {
  await notifyUser(
    userId,
    "REVIEW_APPROVED",
    "⭐ Review Approved",
    `আপনার review "${productName}"-এ publish হয়েছে।`,
    `/products/${productSlug}`,
    { productSlug }
  );
}