"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { heroSlideSchema } from "./validations";

export type HeroActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  slideId?: string;
};

// ==================================================
// PARSE FORM DATA
// ==================================================
function parseFormData(formData: FormData) {
  const getString = (key: string) => {
    const val = formData.get(key);
    return typeof val === "string" ? val : "";
  };

  const getBool = (key: string) => {
    const val = formData.get(key);
    return val === "on" || val === "true";
  };

  const getNum = (key: string, fallback: number) => {
    const val = formData.get(key);
    if (typeof val !== "string" || val === "") return fallback;
    const num = parseInt(val, 10);
    return isNaN(num) ? fallback : num;
  };

  return {
    // Content
    title: getString("title"),
    subtitle: getString("subtitle"),
    description: getString("description"),
    badgeText: getString("badgeText"),
    badgeIcon: getString("badgeIcon"),

    // Visual
    image: getString("image"),
    imageMobile: getString("imageMobile"),

    // CTA 1
    button1Text: getString("button1Text"),
    button1Url: getString("button1Url"),
    button1Icon: getString("button1Icon"),
    button1Style: getString("button1Style") || "primary",

    // CTA 2
    button2Text: getString("button2Text"),
    button2Url: getString("button2Url"),
    button2Icon: getString("button2Icon"),

    // Colors
    overlayColor: getString("overlayColor") || "#000000",
    overlayOpacity: getNum("overlayOpacity", 60),
    textColor: getString("textColor") || "#FFFFFF",
    accentColor: getString("accentColor") || "#7C3AED",

    // Behavior
    isActive: getBool("isActive"),
    sortOrder: getNum("sortOrder", 0),
    openInNewTab: getBool("openInNewTab"),

    // Scheduling
    startAt: getString("startAt"),
    endAt: getString("endAt"),
  };
}

// ==================================================
// BUILD DB DATA
// ==================================================
function buildDbData(data: z.infer<typeof heroSlideSchema>) {
  return {
    title: data.title,
    subtitle: data.subtitle || null,
    description: data.description || null,
    badgeText: data.badgeText || null,
    badgeIcon: data.badgeIcon || null,
    image: data.image,
    imageMobile: data.imageMobile || null,
    button1Text: data.button1Text || null,
    button1Url: data.button1Url || null,
    button1Icon: data.button1Icon || null,
    button1Style: data.button1Style,
    button2Text: data.button2Text || null,
    button2Url: data.button2Url || null,
    button2Icon: data.button2Icon || null,
    overlayColor: data.overlayColor,
    overlayOpacity: data.overlayOpacity,
    textColor: data.textColor,
    accentColor: data.accentColor,
    isActive: data.isActive,
    sortOrder: data.sortOrder,
    openInNewTab: data.openInNewTab,
    startAt: data.startAt ? new Date(data.startAt) : null,
    endAt: data.endAt ? new Date(data.endAt) : null,
  };
}

// ==================================================
// CREATE SLIDE
// ==================================================
export async function createHeroSlideAction(
  prevState: HeroActionState,
  formData: FormData
): Promise<HeroActionState> {
  // ---- AUTH ----
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  // ---- RATE LIMIT ----
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const limit = await rateLimit(
    "hero-slide-create",
    ip,
    RATE_LIMITS.ADMIN_ACTION
  );
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfter);
  }

  // ---- VALIDATE ----
  const parsed = heroSlideSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  // ---- SAVE ----
  try {
    const slide = await prisma.heroSlide.create({
      data: buildDbData(parsed.data),
    });

    // ---- REVALIDATE ----
    revalidatePath("/admin/hero-slider");
    revalidatePath("/");
    revalidatePath("/home");

    return {
      success: true,
      message: "Slide সফলভাবে তৈরি হয়েছে",
      slideId: slide.id,
    };
  } catch (error) {
    console.error("[HERO SLIDER] Create error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// UPDATE SLIDE
// ==================================================
export async function updateHeroSlideAction(
  id: string,
  prevState: HeroActionState,
  formData: FormData
): Promise<HeroActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const limit = await rateLimit(
    "hero-slide-update",
    ip,
    RATE_LIMITS.ADMIN_ACTION
  );
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfter);
  }

  const parsed = heroSlideSchema.safeParse(parseFormData(formData));

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Slide পাওয়া যায়নি" };
    }

    await prisma.heroSlide.update({
      where: { id },
      data: buildDbData(parsed.data),
    });

    revalidatePath("/admin/hero-slider");
    revalidatePath(`/admin/hero-slider/${id}/edit`);
    revalidatePath("/");
    revalidatePath("/home");

    return {
      success: true,
      message: "Slide সফলভাবে update হয়েছে",
      slideId: id,
    };
  } catch (error) {
    console.error("[HERO SLIDER] Update error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// DELETE SLIDE
// ==================================================
export async function deleteHeroSlideAction(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const limit = await rateLimit(
    "hero-slide-delete",
    ip,
    RATE_LIMITS.ADMIN_ACTION
  );
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfter);
  }

  try {
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) {
      return { success: false, message: "Slide পাওয়া যায়নি" };
    }

    await prisma.heroSlide.delete({ where: { id } });

    revalidatePath("/admin/hero-slider");
    revalidatePath("/");

    return {
      success: true,
      message: "Slide delete হয়েছে",
    };
  } catch (error) {
    console.error("[HERO SLIDER] Delete error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে",
    };
  }
}

// ==================================================
// TOGGLE ACTIVE STATUS
// ==================================================
export async function toggleHeroSlideActiveAction(
  id: string,
  isActive: boolean
) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.heroSlide.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/hero-slider");
    revalidatePath("/");

    return {
      success: true,
      message: isActive ? "Slide চালু হয়েছে" : "Slide বন্ধ হয়েছে",
    };
  } catch (error) {
    console.error("[HERO SLIDER] Toggle error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// REORDER SLIDES (bulk update sortOrder)
// ==================================================
export async function reorderHeroSlidesAction(
  orderedIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  // ---- VALIDATE INPUT ----
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, message: "Invalid input" };
  }

  if (orderedIds.length > 50) {
    return { success: false, message: "অনেক বেশি slide" };
  }

  // ---- VERIFY ALL IDS EXIST ----
  const existing = await prisma.heroSlide.findMany({
    where: { id: { in: orderedIds } },
    select: { id: true },
  });

  if (existing.length !== orderedIds.length) {
    return { success: false, message: "কিছু slide পাওয়া যায়নি" };
  }

  // ---- UPDATE SORT ORDER ----
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.heroSlide.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/admin/hero-slider");
    revalidatePath("/");

    return { success: true, message: "Order update হয়েছে" };
  } catch (error) {
    console.error("[HERO SLIDER] Reorder error:", error);
    return { success: false, message: "কিছু ভুল হয়েছে" };
  }
}

// ==================================================
// INCREMENT VIEW COUNT
// ==================================================
// Called from client when slide renders
// No auth needed (public analytics)
// ==================================================
export async function incrementSlideViewCountAction(
  slideId: string
): Promise<{ success: boolean }> {
  try {
    await prisma.heroSlide.update({
      where: { id: slideId },
      data: { viewCount: { increment: 1 } },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ==================================================
// INCREMENT CLICK COUNT
// ==================================================
export async function incrementSlideClickCountAction(
  slideId: string
): Promise<{ success: boolean }> {
  try {
    await prisma.heroSlide.update({
      where: { id: slideId },
      data: { clickCount: { increment: 1 } },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}