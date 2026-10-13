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
    // Google from authConfig
    ...authConfig.providers,
    // Credentials (email/password)
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordHash) return null;
        if (user.status !== "ACTIVE") return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

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
      // Google sign-in — check if user exists and is active
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user exists but is suspended/banned
        if (existingUser && existingUser.status !== "ACTIVE") {
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // When Google creates a new user, create a wallet
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