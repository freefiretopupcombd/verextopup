"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { submitContactAction, type ActionState } from "../actions";

const initialState: ActionState = { success: false };

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Message পাঠানো হয়েছে!");
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4"
    >
      <h2 className="font-bold text-text-primary text-base mb-2">
        Send us a Message
      </h2>

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            আপনার নাম *
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="যেমন: Rahim Ahmed"
            className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary ${
              state.errors?.name ? "border-danger" : "border-border"
            }`}
          />
          {state.errors?.name && (
            <p className="mt-1 text-xs text-danger">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary ${
              state.errors?.email ? "border-danger" : "border-border"
            }`}
          />
          {state.errors?.email && (
            <p className="mt-1 text-xs text-danger">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Phone (optional)
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="+880 1XXX-XXXXXX"
          className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Subject *
        </label>
        <input
          name="subject"
          type="text"
          required
          placeholder="যেমন: Payment issue"
          className={`w-full px-3 py-2.5 rounded-lg bg-bg-input border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary ${
            state.errors?.subject ? "border-danger" : "border-border"
          }`}
        />
        {state.errors?.subject && (
          <p className="mt-1 text-xs text-danger">{state.errors.subject[0]}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Message *
        </label>
        <textarea
          name="message"
          rows={6}
          required
          placeholder="আপনার message বিস্তারিত লিখুন..."
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
        {isPending ? "পাঠানো হচ্ছে..." : "Send Message"}
      </button>

      {state.success && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg p-3 text-xs text-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Message সফলভাবে পাঠানো হয়েছে। আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।
        </div>
      )}

      <p className="text-[10px] text-text-muted text-center">
        আপনার তথ্য সম্পূর্ণ গোপনীয় থাকবে
      </p>
    </form>
  );
}