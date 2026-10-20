"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// UPDATE PROFILE
// ==================================================
const profileSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ character").max(100),
  phone: z
    .string()
    .max(20, "Phone number অনেক বড়")
    .optional()
    .or(z.literal("")),
});

export async function updateProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Login করুন" };
  }

  const userId = (session.user as any).id;

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
    });

    revalidatePath("/account/profile");
    revalidatePath("/account");

    return {
      success: true,
      message: "প্রোফাইল সফলভাবে update হয়েছে",
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// CHANGE PASSWORD
// ==================================================
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "বর্তমান password দিন"),
    newPassword: z
      .string()
      .min(8, "নতুন password কমপক্ষে ৮ character")
      .max(100),
    confirmPassword: z.string().min(1, "Confirm password দিন"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "নতুন password দুটো মিলছে না",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Login করুন" };
  }

  const userId = (session.user as any).id;

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return {
        success: false,
        message: "বর্তমান password যাচাই করা যায়নি",
      };
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash
    );

    if (!isValid) {
      return {
        success: false,
        errors: {
          currentPassword: ["বর্তমান password ভুল"],
        },
      };
    }

    // Hash new password
    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return {
      success: true,
      message: "Password সফলভাবে পরিবর্তন হয়েছে",
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}