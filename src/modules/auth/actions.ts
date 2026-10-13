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
// REGISTER
// ==================================================
export async function registerAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ---- RATE LIMIT (by IP) ----
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const ipLimit = await rateLimit("register-ip", ip, RATE_LIMITS.REGISTER);
  if (!ipLimit.success) {
    return rateLimitResponse(ipLimit.retryAfter);
  }

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate
  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // ---- RATE LIMIT (by email) ----
  // Prevents attackers from creating many accounts with same email
  const emailLimit = await rateLimit(
    "register-email",
    normalizedEmail,
    RATE_LIMITS.REGISTER
  );
  if (!emailLimit.success) {
    return rateLimitResponse(emailLimit.retryAfter);
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return {
        success: false,
        errors: {
          email: ["এই email দিয়ে account আছে। Login করুন।"],
        },
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: normalizedEmail.split("@")[0],
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    // Create wallet for user
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: "BDT",
      },
    });

    // Welcome notification
    await notifyWelcome(user.id, user.name || "Friend");

    // Auto sign in
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: "Account created! Redirecting...",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Auto-login failed. Please login manually.",
      };
    }

    console.error("Register error:", error);
    return {
      success: false,
      message: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

// ==================================================
// LOGIN
// ==================================================
export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ---- RATE LIMIT (by IP) ----
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const ipLimit = await rateLimit("login-ip", ip, RATE_LIMITS.LOGIN);
  if (!ipLimit.success) {
    return rateLimitResponse(ipLimit.retryAfter);
  }

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();

  // ---- RATE LIMIT (by email) ----
  // Critical: prevents brute force on a specific account
  const emailLimit = await rateLimit(
    "login-email",
    normalizedEmail,
    RATE_LIMITS.LOGIN
  );
  if (!emailLimit.success) {
    return rateLimitResponse(emailLimit.retryAfter);
  }

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password: parsed.data.password,
      redirect: false,
    });

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Email বা Password ভুল",
          };
        default:
          return {
            success: false,
            message: "Login failed",
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