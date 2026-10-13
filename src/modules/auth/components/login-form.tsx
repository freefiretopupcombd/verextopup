"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { loginAction, type ActionState } from "../actions";
import { GoogleButton } from "./google-button";

const initialState: ActionState = { success: false };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Login সফল!");
      router.push(callbackUrl);
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router, callbackUrl]);

  return (
    <div className="space-y-5">
      {/* Google Login */}
      <GoogleButton mode="login" callbackUrl={callbackUrl} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-content-muted">অথবা</span>
        </div>
      </div>

      {/* Email/Password Form */}
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
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-content"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Password ভুলে গেছেন?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="আপনার password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content placeholder:text-content-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {state.errors?.password && (
            <p className="mt-1.5 text-sm text-error">
              {state.errors.password[0]}
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
          {isPending ? "Login হচ্ছে..." : "Login"}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-content-muted">
        Account নেই?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-medium"
        >
          Register করুন
        </Link>
      </p>
    </div>
  );
}