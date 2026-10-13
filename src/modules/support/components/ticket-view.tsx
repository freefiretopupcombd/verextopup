"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { customerReplyAction, type ActionState } from "../actions";

const initialState: ActionState = { success: false };

const STATUS_STYLE: Record<string, { bg: string; label: string; icon: any }> = {
  OPEN: { bg: "bg-primary/15 text-primary", label: "Open", icon: MessageSquare },
  PENDING: { bg: "bg-warning/15 text-warning", label: "Pending", icon: Clock },
  ANSWERED: { bg: "bg-success/15 text-success", label: "Answered", icon: CheckCircle2 },
  CLOSED: { bg: "bg-text-muted/15 text-text-muted", label: "Closed", icon: XCircle },
};

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "সাধারণ প্রশ্ন",
  ORDER: "Order সমস্যা",
  PAYMENT: "Payment সমস্যা",
  WALLET: "Wallet সমস্যা",
  TECHNICAL: "Technical সমস্যা",
  OTHER: "অন্যান্য",
};

export function TicketView({ ticket }: { ticket: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    customerReplyAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Reply পাঠানো হয়েছে");
      formRef.current?.reset();
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const style = STATUS_STYLE[ticket.status] || STATUS_STYLE.OPEN;
  const StatusIcon = style.icon;
  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-primary font-bold">
              {ticket.ticketNo}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary mt-1">
              {ticket.subject}
            </h1>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${style.bg}`}
          >
            <StatusIcon className="w-3 h-3" />
            {style.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-text-muted mb-0.5">Category</div>
            <div className="text-text-primary font-medium">
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </div>
          </div>
          <div>
            <div className="text-text-muted mb-0.5">Created</div>
            <div className="text-text-primary font-medium">
              {new Date(ticket.createdAt).toLocaleString("en-GB")}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold text-text-primary text-sm mb-4">
          Conversation ({ticket.messages.length})
        </h2>

        <div className="space-y-4">
          {ticket.messages.map((msg: any) => {
            const isCustomer = msg.senderType === "CUSTOMER";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCustomer ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCustomer
                      ? "bg-primary/15 text-primary"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  {isCustomer ? "You" : "VT"}
                </div>

                <div
                  className={`flex-1 min-w-0 max-w-[85%] ${
                    isCustomer ? "" : "text-right"
                  }`}
                >
                  <div
                    className={`inline-block text-left rounded-xl p-3 ${
                      isCustomer
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-accent/5 border border-accent/20"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-semibold mb-1 ${
                        isCustomer ? "text-primary" : "text-accent"
                      }`}
                    >
                      {isCustomer ? "You" : "VerexTopUp Support"}
                    </div>
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                  <div className="text-[10px] text-text-muted mt-1">
                    {new Date(msg.createdAt).toLocaleString("en-GB")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply form */}
      {!isClosed ? (
        <form
          ref={formRef}
          action={formAction}
          className="bg-bg-card border border-border rounded-xl p-5 space-y-3"
        >
          <input type="hidden" name="ticketId" value={ticket.id} />

          <label className="block text-sm font-medium text-text-primary">
            আপনার Reply
          </label>

          <textarea
            name="message"
            rows={3}
            required
            placeholder="আপনার উত্তর বা অতিরিক্ত তথ্য লিখুন..."
            className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary resize-none"
          />

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
            {isPending ? "পাঠানো হচ্ছে..." : "Reply পাঠান"}
          </button>
        </form>
      ) : (
        <div className="bg-bg-secondary border border-border rounded-xl p-5 text-center">
          <XCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-sm text-text-muted">
            এই ticket বন্ধ করা হয়েছে
          </p>
          <p className="text-xs text-text-muted mt-1">
            নতুন সমস্যা হলে নতুন ticket তৈরি করুন
          </p>
        </div>
      )}
    </div>
  );
}