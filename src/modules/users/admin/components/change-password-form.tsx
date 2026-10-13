"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { changePasswordAction, type ActionState } from "../../actions";

const initialState: ActionState = { success: false };

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Password changed");
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {/* Current password */}
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-content mb-1.5"
        >
          বর্তমান Password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        {state.errors?.currentPassword && (
          <p className="mt-1.5 text-sm text-error">
            {state.errors.currentPassword[0]}
          </p>
        )}
      </div>

      {/* New password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-content mb-1.5"
        >
          নতুন Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="কমপক্ষে ৮ character"
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        {state.errors?.newPassword && (
          <p className="mt-1.5 text-sm text-error">
            {state.errors.newPassword[0]}
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-content mb-1.5"
        >
          নতুন Password (আবার)
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
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
        className="bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "পরিবর্তন হচ্ছে..." : "Password পরিবর্তন করুন"}
      </button>
    </form>
  );
}