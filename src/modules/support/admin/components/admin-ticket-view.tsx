"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import {
  adminReplyAction,
  updateTicketStatusAction,
  updateTicketPriorityAction,
  type ActionState,
} from "../../actions";

const initialState: ActionState = { success: false };

const STATUS_OPTIONS = ["OPEN", "PENDING", "ANSWERED", "CLOSED"];
const PRIORITY_OPTIONS = ["LOW", "NORMAL", "HIGH", "URGENT"];

export function AdminTicketView({ ticket }: { ticket: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    adminReplyAction,
    initialState
  );
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Reply পাঠানো হয়েছে");
      formRef.current?.reset();
      setIsInternal(false);
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleStatus = (status: string) => {
    updateTicketStatusAction(ticket.id, status as any).then((r) => {
      if (r.success) {
        toast.success("Status update হয়েছে");
        router.refresh();
      }
    });
  };

  const handlePriority = (priority: string) => {
    updateTicketPriorityAction(ticket.id, priority as any).then((r) => {
      if (r.success) {
        toast.success("Priority update হয়েছে");
        router.refresh();
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      {/* LEFT */}
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-primary font-bold">
                {ticket.ticketNo}
              </div>
              <h2 className="text-lg font-bold text-text-primary mt-1">
                {ticket.subject}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-text-muted mb-0.5">Customer</div>
              <div className="text-text-primary font-medium truncate">
                {ticket.user.name || "Unknown"}
              </div>
              <div className="text-text-muted truncate">{ticket.user.email}</div>
            </div>
            <div>
              <div className="text-text-muted mb-0.5">Category</div>
              <div className="text-text-primary font-medium">
                {ticket.category}
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
          <h3 className="font-bold text-text-primary text-sm mb-4">
            Conversation ({ticket.messages.length})
          </h3>

          <div className="space-y-4">
            {ticket.messages.map((msg: any) => {
              const isCustomer = msg.senderType === "CUSTOMER";
              const isAdmin = msg.senderType === "ADMIN";

              return (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 ${
                    isCustomer
                      ? "bg-primary/5 border-l-2 border-primary"
                      : isAdmin
                        ? "bg-accent/5 border-l-2 border-accent"
                        : "bg-bg-secondary border-l-2 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCustomer
                          ? "text-primary"
                          : isAdmin
                            ? "text-accent"
                            : "text-text-muted"
                      }`}
                    >
                      {isCustomer ? "Customer" : isAdmin ? "Admin" : "System"}
                      {msg.isInternal && (
                        <span className="ml-2 text-warning flex-inline items-center gap-1">
                          <Lock className="w-2.5 h-2.5 inline" />
                          INTERNAL
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(msg.createdAt).toLocaleString("en-GB")}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reply form */}
        <form
          ref={formRef}
          action={formAction}
          className="bg-bg-card border border-border rounded-xl p-5 space-y-3"
        >
          <input type="hidden" name="ticketId" value={ticket.id} />

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">
              Reply
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                name="isInternal"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-3.5 h-3.5 text-warning rounded"
              />
              <span className="text-text-muted">Internal note</span>
            </label>
          </div>

          <textarea
            name="message"
            rows={4}
            required
            placeholder={
              isInternal
                ? "Internal note (customer দেখবে না)..."
                : "Customer-কে reply লিখুন..."
            }
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
            {isPending ? "পাঠানো হচ্ছে..." : isInternal ? "Save Note" : "Send Reply"}
          </button>
        </form>
      </div>

      {/* RIGHT — Actions */}
      <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        {/* Status */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-text-primary text-sm mb-3">Status</h3>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                disabled={ticket.status === s}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition ${
                  ticket.status === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary text-text-secondary"
                }`}
              >
                <span>{s}</span>
                {ticket.status === s && (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-text-primary text-sm mb-3">Priority</h3>
          <div className="space-y-2">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => handlePriority(p)}
                disabled={ticket.priority === p}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition ${
                  ticket.priority === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary text-text-secondary"
                }`}
              >
                <span>{p}</span>
                {ticket.priority === p && (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}