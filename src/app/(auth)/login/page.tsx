import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login — VerexTopUp",
  description: "Login to your VerexTopUp account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">VerexTopUp</h1>
          </Link>
          <p className="text-content-muted mt-2">
            আপনার account-এ login করুন
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          <h2 className="text-2xl font-bold text-content mb-6">Welcome Back</h2>
          <Suspense fallback={<div className="text-center text-content-muted">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-content-light mt-6">
          <Link href="/" className="hover:text-primary">
            ← Home-এ ফিরে যান
          </Link>
        </p>
      </div>
    </div>
  );
}