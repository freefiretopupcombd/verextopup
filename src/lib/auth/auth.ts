import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] 🔵 authorize() called");

        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsed.success) {
          console.log("[AUTH] ❌ Invalid credentials format");
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        console.log("[AUTH] 🔍 User lookup:", {
          email,
          found: !!user,
          hasPassword: !!user?.passwordHash,
          status: user?.status,
          role: user?.role,
        });

        if (!user) {
          console.log("[AUTH] ❌ User not found");
          return null;
        }

        if (!user.passwordHash) {
          console.log("[AUTH] ❌ No password hash");
          return null;
        }

        if (user.status !== "ACTIVE") {
          console.log("[AUTH] ❌ User status:", user.status);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log("[AUTH] 🔐 Password valid:", isValid);

        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        console.log("[AUTH] ✅ authorize() success");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser && existingUser.status !== "ACTIVE") {
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        const existingWallet = await prisma.wallet.findUnique({
          where: { userId: user.id },
        });

        if (!existingWallet) {
          await prisma.wallet.create({
            data: {
              userId: user.id,
              balance: 0,
              currency: "BDT",
            },
          });
        }
      }
    },
  },
});