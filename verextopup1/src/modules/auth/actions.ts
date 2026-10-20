"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { z } from "zod";

import { notifyWelcome } from "@/modules/notifications/hooks";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth/auth";
import {
  rateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { registerSchema, loginSchema } from "./validations";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ==================================================
// REGISTER — FULL DEBUG
// ==================================================
export async function registerAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  console.log("\n========================================");
  console.log("🔵 [REGISTER] START");
  console.log("========================================");

  // ---- RATE LIMIT (by IP) ----
  const headersList = await headers();
  const ip = getClientIp(headersList);
  console.log("[REGISTER] 📍 IP:", ip);

  const ipLimit = await rateLimit("register-ip", ip, RATE_LIMITS.REGISTER);
  if (!ipLimit.success) {
    console.log("[REGISTER] ❌ IP RATE LIMITED:", ipLimit.retryAfter, "seconds");
    return rateLimitResponse(ipLimit.retryAfter);
  }
  console.log("[REGISTER] ✅ IP rate limit passed");

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  console.log("[REGISTER] 📥 Raw data:", {
    email: rawData.email,
    passwordLength: rawData.password?.length,
    hasConfirm: !!rawData.confirmPassword,
  });

  // Validate
  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    console.log("[REGISTER] ❌ VALIDATION FAILED:", errors);
    return {
      success: false,
      errors,
    };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  console.log("[REGISTER] ✅ Validation passed:", normalizedEmail);

  // ---- RATE LIMIT (by email) ----
  const emailLimit = await rateLimit(
    "register-email",
    normalizedEmail,
    RATE_LIMITS.REGISTER
  );
  if (!emailLimit.success) {
    console.log(
      "[REGISTER] ❌ EMAIL RATE LIMITED:",
      emailLimit.retryAfter,
      "seconds"
    );
    return rateLimitResponse(emailLimit.retryAfter);
  }
  console.log("[REGISTER] ✅ Email rate limit passed");

  try {
    console.log("[REGISTER] 🔍 Checking if user exists...");
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      console.log("[REGISTER] ❌ USER ALREADY EXISTS:", normalizedEmail);
      return {
        success: false,
        errors: {
          email: ["এই email দিয়ে account আছে। Login করুন।"],
        },
      };
    }
    console.log("[REGISTER] ✅ User does not exist, proceeding...");

    console.log("[REGISTER] 🔐 Hashing password...");
    const passwordHash = await bcrypt.hash(password, 12);
    console.log("[REGISTER] ✅ Password hashed");

    console.log("[REGISTER] 💾 Creating user + wallet in transaction...");
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: normalizedEmail.split("@")[0],
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });
      console.log("[REGISTER] ✅ User created:", newUser.id);

      await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0,
          currency: "BDT",
        },
      });
      console.log("[REGISTER] ✅ Wallet created");

      return newUser;
    });

    // Welcome notification (non-blocking)
    try {
      await notifyWelcome(user.id, user.name || "Friend");
      console.log("[REGISTER] ✅ Welcome notification sent");
    } catch (e) {
      console.warn("[REGISTER] ⚠️ Welcome notification failed:", e);
    }

    // Auto sign-in
    try {
      console.log("[REGISTER] 🔑 Auto sign-in...");
      await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });
      console.log("[REGISTER] ✅ Auto sign-in successful");
    } catch (signInError) {
      console.error("[REGISTER] ⚠️ Auto sign-in failed:", signInError);
      return {
        success: true,
        message: "Account created! Please login manually.",
      };
    }

    console.log("🟢 [REGISTER] SUCCESS");
    return {
      success: true,
      message: "Account created! Redirecting...",
    };
  } catch (error) {
    console.error("\n========================================");
    console.error("🔴 [REGISTER] FAILED");
    console.error("========================================");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", (error as Error)?.message);
    console.error("Full error:", error);
    console.error("========================================\n");

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          errors: {
            email: ["এই email দিয়ে account আছে। Login করুন।"],
          },
        };
      }
    }

    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// LOGIN — FULL DEBUG
// ==================================================
export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  console.log("\n========================================");
  console.log("🔵 [LOGIN] START");
  console.log("========================================");

  // ---- RATE LIMIT ----
  const headersList = await headers();
  const ip = getClientIp(headersList);
  console.log("[LOGIN] 📍 IP:", ip);

  const ipLimit = await rateLimit("login-ip", ip, RATE_LIMITS.LOGIN);
  if (!ipLimit.success) {
    console.log("[LOGIN] ❌ IP RATE LIMITED:", ipLimit.retryAfter, "seconds");
    return rateLimitResponse(ipLimit.retryAfter);
  }
  console.log("[LOGIN] ✅ IP rate limit passed");

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log("[LOGIN] 📥 Attempt:", {
    email: rawData.email,
    passwordLength: rawData.password?.length,
  });

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    console.log("[LOGIN] ❌ VALIDATION FAILED:", errors);
    return {
      success: false,
      errors,
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  console.log("[LOGIN] ✅ Validation passed:", normalizedEmail);

  // ---- RATE LIMIT (by email) ----
  const emailLimit = await rateLimit(
    "login-email",
    normalizedEmail,
    RATE_LIMITS.LOGIN
  );
  if (!emailLimit.success) {
    console.log("[LOGIN] ❌ EMAIL RATE LIMITED:", emailLimit.retryAfter, "s");
    return rateLimitResponse(emailLimit.retryAfter);
  }
  console.log("[LOGIN] ✅ Email rate limit passed");

  // ---- PRE-CHECK USER IN DB ----
  console.log("[LOGIN] 🔍 Pre-checking user in DB...");
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      status: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user) {
    console.log("[LOGIN] ❌ USER NOT FOUND in DB:", normalizedEmail);
    return {
      success: false,
      message: "Email বা Password ভুল",
    };
  }

  console.log("[LOGIN] ✅ User found in DB:", {
    id: user.id,
    status: user.status,
    role: user.role,
    hasPasswordHash: !!user.passwordHash,
    passwordHashLength: user.passwordHash?.length || 0,
  });

  if (!user.passwordHash) {
    console.log("[LOGIN] ❌ USER HAS NO PASSWORD HASH");
    return {
      success: false,
      message: "এই account এ password set করা নেই। Register করুন।",
    };
  }

  if (user.status !== "ACTIVE") {
    console.log("[LOGIN] ❌ USER STATUS NOT ACTIVE:", user.status);
    return {
      success: false,
      message: `আপনার account ${user.status.toLowerCase()} করা আছে।`,
    };
  }

  // ---- PASSWORD VERIFY ----
  console.log("[LOGIN] 🔐 Verifying password with bcrypt...");
  const isValidPassword = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash
  );
  console.log("[LOGIN] 🔐 Password valid:", isValidPassword);

  if (!isValidPassword) {
    console.log("[LOGIN] ❌ WRONG PASSWORD");
    return {
      success: false,
      message: "Email বা Password ভুল",
    };
  }

  // ---- SIGN IN ----
  try {
    console.log("[LOGIN] 🔑 Calling signIn...");
    await signIn("credentials", {
      email: normalizedEmail,
      password: parsed.data.password,
      redirect: false,
    });
    console.log("🟢 [LOGIN] SUCCESS");
    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    console.error("\n========================================");
    console.error("🔴 [LOGIN] SIGNIN FAILED");
    console.error("========================================");
    console.error("Error:", error);
    console.error("========================================\n");

    if (error instanceof AuthError) {
      console.error("[LOGIN] AuthError type:", error.type);
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Email বা Password ভুল",
          };
        default:
          return {
            success: false,
            message: `Login failed: ${error.type}`,
          };
      }
    }
    return {
      success: false,
      message: "কিছু ভুল হয়েছে",
    };
  }
}

// ==================================================
// LOGOUT
// ==================================================
export async function logoutAction() {
  const { signOut } = await import("@/lib/auth/auth");
  await signOut({ redirectTo: "/" });
}