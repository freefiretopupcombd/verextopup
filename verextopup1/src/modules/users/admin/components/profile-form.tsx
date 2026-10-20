"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProfileAction, type ActionState } from "../../actions";

const initialState: ActionState = { success: false };

export function ProfileForm({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Profile updated");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-content mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-content-muted cursor-not-allowed"
        />
        <p className="mt-1.5 text-xs text-content-muted">
          Email পরিবর্তন করা যাবে না
        </p>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-content mb-1.5"
        >
          নাম
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          required
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        {state.errors?.name && (
          <p className="mt-1.5 text-sm text-error">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-content mb-1.5"
        >
          ফোন নাম্বার (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialPhone}
          placeholder="+880 1XXX-XXXXXX"
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        {state.errors?.phone && (
          <p className="mt-1.5 text-sm text-error">{state.errors.phone[0]}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "Update হচ্ছে..." : "Update Profile"}
      </button>
    </form>
  );
}