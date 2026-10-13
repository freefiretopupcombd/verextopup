"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth/session";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { reviewSchema, replySchema } from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// CREATE REVIEW
// ==================================================
export async function createReviewAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAuth("/");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  // ---- RATE LIMIT ----
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const userLimit = await rateLimit(
    "review-user",
    userId,
    RATE_LIMITS.REVIEW_SUBMIT
  );
  if (!userLimit.success) {
    return rateLimitResponse(userLimit.retryAfter);
  }

  const ipLimit = await rateLimit(
    "review-ip",
    ip,
    RATE_LIMITS.REVIEW_SUBMIT
  );
  if (!ipLimit.success) {
    return rateLimitResponse(ipLimit.retryAfter);
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    orderId: formData.get("orderId") || null,
    rating: formData.get("rating"),
    title: formData.get("title") || "",
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { productId, orderId, rating, title, content, imageUrl } =
    parsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return { success: false, message: "Product পাওয়া যায়নি" };
    }

    let isVerifiedPurchase = false;

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order || order.userId !== userId) {
        return { success: false, message: "Order পাওয়া যায়নি" };
      }

      if (order.status !== "COMPLETED") {
        return {
          success: false,
          message: "শুধু completed order-এ review দেওয়া যাবে",
        };
      }

      const hasProduct = order.items.some(
        (item) => item.productId === productId
      );
      if (!hasProduct) {
        return {
          success: false,
          message: "এই product আপনার order-এ নেই",
        };
      }

      isVerifiedPurchase = true;

      const existing = await prisma.review.findFirst({
        where: { productId, userId, orderId },
      });

      if (existing) {
        return {
          success: false,
          message: "এই order-এর জন্য আপনি আগেই review দিয়েছেন",
        };
      }
    } else {
      const existing = await prisma.review.findFirst({
        where: { productId, userId, orderId: null },
      });

      if (existing) {
        return {
          success: false,
          message: "এই product-এ আপনি আগেই review দিয়েছেন। Account → Reviews থেকে edit করতে পারেন।",
        };
      }
    }

    await prisma.review.create({
      data: {
        productId,
        userId,
        orderId: orderId || null,
        rating,
        title: title || null,
        content,
        imageUrl: imageUrl || null,
        status: "PENDING",
        isVerifiedPurchase,
      },
    });

    revalidatePath("/account/reviews");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/reviews");

    return {
      success: true,
      message: "Review সফলভাবে submit হয়েছে! Admin approve করলে publish হবে।",
    };
  } catch (error) {
    console.error("Create review error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// UPDATE REVIEW
// ==================================================
export async function updateReviewAction(
  reviewId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAuth("/account/reviews");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    orderId: formData.get("orderId") || null,
    rating: formData.get("rating"),
    title: formData.get("title") || "",
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { rating, title, content, imageUrl } = parsed.data;

  try {
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing || existing.userId !== userId) {
      return { success: false, message: "Review পাওয়া যায়নি" };
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        title: title || null,
        content,
        imageUrl: imageUrl || null,
        status: "PENDING",
      },
    });

    revalidatePath("/account/reviews");
    revalidatePath("/admin/reviews");

    return { success: true, message: "Review update হয়েছে" };
  } catch (error) {
    console.error("Update review error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// DELETE REVIEW
// ==================================================
export async function deleteReviewAction(reviewId: string) {
  let session;
  try {
    session = await requireAuth("/account/reviews");
  } catch {
    return { success: false, message: "Login করতে হবে" };
  }

  const userId = (session.user as any).id as string;

  try {
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing || existing.userId !== userId) {
      return { success: false, message: "Review পাওয়া যায়নি" };
    }

    await prisma.review.delete({ where: { id: reviewId } });

    revalidatePath("/account/reviews");
    revalidatePath("/admin/reviews");

    return { success: true, message: "Review delete হয়েছে" };
  } catch (error) {
    console.error("Delete review error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — STATUS
// ==================================================
export async function updateReviewStatusAction(
  reviewId: string,
  status: "APPROVED" | "REJECTED" | "HIDDEN" | "PENDING"
) {
  try {
    await requireAdmin();

    await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/products");

    return { success: true, message: "Status update হয়েছে" };
  } catch (error) {
    console.error("Update review status error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — FEATURED
// ==================================================
export async function toggleReviewFeaturedAction(
  reviewId: string,
  featured: boolean
) {
  try {
    await requireAdmin();

    await prisma.review.update({
      where: { id: reviewId },
      data: { isFeatured: featured },
    });

    revalidatePath("/admin/reviews");
    return { success: true, message: "Updated" };
  } catch (error) {
    return { success: false, message: "Failed" };
  }
}

// ==================================================
// ADMIN — REPLY
// ==================================================
export async function replyToReviewAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const adminId = (session.user as any).id as string;

  const parsed = replySchema.safeParse({
    reviewId: formData.get("reviewId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { reviewId, content } = parsed.data;

  try {
    await prisma.reviewReply.create({
      data: {
        reviewId,
        adminId,
        content,
      },
    });

    revalidatePath(`/admin/reviews/${reviewId}`);
    revalidatePath("/products");

    return { success: true, message: "Reply যোগ হয়েছে" };
  } catch (error) {
    console.error("Reply error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// ADMIN — DELETE REPLY
// ==================================================
export async function deleteReplyAction(replyId: string) {
  try {
    await requireAdmin();

    await prisma.reviewReply.delete({ where: { id: replyId } });

    revalidatePath("/admin/reviews");
    revalidatePath("/products");

    return { success: true, message: "Reply delete হয়েছে" };
  } catch (error) {
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}