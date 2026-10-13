"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { createTicketAction, type ActionState } from "../actions";
import { TICKET_CATEGORIES } from "../validations";

const initialState: ActionState = { success: false };

export function CreateTicketForm({
  orders,
}: {
  orders: { id: string; orderNumber: string; status: string }[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createTicketAction,
    initialState
  );

  useEffect(() => {
    if (state.success && state.ticketId) {
      toast.success(state.message || "Ticket তৈরি হয়েছে!");
      router.push(`/account/support/${state.ticketId}`);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="bg-bg-card border border-border rounded-xl p-5 space-y-4"
    >
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Subject *
        </label>
        <input
          name="subject"
          type="text"
          required
          placeholder="যেমন: Payment verify হচ্ছে না"
          className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary ${
            state.errors?.subject ? "border-danger" : "border-border"
          }`}
        />
        {state.errors?.subject && (
          <p className="mt-1 text-xs text-danger">{state.errors.subject[0]}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Category *
        </label>
        <select
          name="category"
          required
          defaultValue="GENERAL"
          className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
        >
          {TICKET_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Order (optional) */}
      {orders.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Related Order (optional)
          </label>
          <select
            name="orderId"
            defaultValue=""
            className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">— কোনো order নেই —</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {o.status}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-text-dim">
            কোনো order সম্পর্কিত সমস্যা হলে select করুন
          </p>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          আপনার সমস্যা বিস্তারিত লিখুন *
        </label>
        <textarea
          name="message"
          rows={6}
          required
          placeholder="আপনার সমস্যা বিস্তারিত লিখুন..."
          className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary resize-none ${
            state.errors?.message ? "border-danger" : "border-border"
          }`}
        />
        {state.errors?.message && (
          <p className="mt-1 text-xs text-danger">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isPending ? "Creating..." : "Create Ticket"}
      </button>

      <p className="text-[10px] text-text-muted text-center">
        আমরা ২৪ ঘণ্টার মধ্যে reply করব
      </p>
    </form>
  );
}