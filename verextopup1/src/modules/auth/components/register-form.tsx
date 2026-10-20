"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { registerAction, type ActionState } from "../actions";
import { GoogleButton } from "./google-button";

const initialState: ActionState = { success: false };

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Account তৈরি হয়েছে!");
      router.push("/account");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="space-y-5">
      {/* Google Sign Up */}
      <GoogleButton mode="register" callbackUrl="/account" />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-content-muted">অথবা</span>
        </div>
      </div>

      {/* Email Form */}
      <form action={formAction} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-content mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content placeholder:text-content-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {state.errors?.email && (
            <p className="mt-1.5 text-sm text-error">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-content mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="কমপক্ষে ৮ character"
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content placeholder:text-content-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {state.errors?.password && (
            <p className="mt-1.5 text-sm text-error">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-content mb-1.5"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="আবার password দিন"
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content placeholder:text-content-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {state.errors?.confirmPassword && (
            <p className="mt-1.5 text-sm text-error">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Account তৈরি হচ্ছে..." : "Create Account"}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-content-muted">
        আগে থেকেই account আছে?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          Login করুন
        </Link>
      </p>
    </div>
  );
}