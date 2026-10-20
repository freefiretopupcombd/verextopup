import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/modules/auth/components/register-form";

export const metadata: Metadata = {
  title: "Register — VerexTopUp",
  description: "Create your VerexTopUp account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">VerexTopUp</h1>
          </Link>
          <p className="text-content-muted mt-2">
            নতুন account তৈরি করুন
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          <h2 className="text-2xl font-bold text-content mb-6">
            Create Account
          </h2>
          <RegisterForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-content-light mt-6">
          Account তৈরি করলে আপনি আমাদের{" "}
          <Link href="/terms" className="hover:text-primary">
            Terms
          </Link>{" "}
          এবং{" "}
          <Link href="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>{" "}
          মেনে নিচ্ছেন।
        </p>
      </div>
    </div>
  );
}