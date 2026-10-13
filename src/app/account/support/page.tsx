import type { Metadata } from "next";
import Link from "next/link";
import { Plus, MessageSquare, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getUserTickets } from "@/modules/support/queries";

export const metadata: Metadata = {
  title: "Support — VerexTopUp",
};

const STATUS_STYLE: Record<string, { bg: string; label: string }> = {
  OPEN: { bg: "bg-primary/15 text-primary", label: "Open" },
  PENDING: { bg: "bg-warning/15 text-warning", label: "Pending" },
  ANSWERED: { bg: "bg-success/15 text-success", label: "Answered" },
  CLOSED: { bg: "bg-text-muted/15 text-text-muted", label: "Closed" },
};

export default async function SupportPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;
  const tickets = await getUserTickets(userId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Support
          </h1>
          <p className="text-sm text-text-muted mt-1">
            সাহায্য দরকার? আমরা এখানে আছি
          </p>
        </div>

        <Link
          href="/account/support/new"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          নতুন Ticket
        </Link>
      </div>

      {/* Status bar */}
      <div className="bg-success/5 border border-success/30 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-success">
            সব সিস্টেম operational
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            সাধারণত ২৪ ঘণ্টার মধ্যে reply করা হয়
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/faq"
          className="bg-bg-card border border-border hover:border-primary/50 rounded-xl p-4 transition group"
        >
          <div className="text-sm font-bold text-text-primary mb-0.5 flex items-center gap-1">
            FAQ
            <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-primary transition" />
          </div>
          <p className="text-[10px] text-text-muted">সাধারণ প্রশ্ন</p>
        </Link>

        <Link
          href="/contact"
          className="bg-bg-card border border-border hover:border-primary/50 rounded-xl p-4 transition group"
        >
          <div className="text-sm font-bold text-text-primary mb-0.5 flex items-center gap-1">
            Contact Us
            <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-primary transition" />
          </div>
          <p className="text-[10px] text-text-muted">সরাসরি যোগাযোগ</p>
        </Link>
      </div>

      {/* Tickets List */}
      <div>
        <h2 className="font-bold text-text-primary text-sm mb-3">
          আমার Tickets ({tickets.length})
        </h2>

        {tickets.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              এখনো কোনো ticket নেই
            </h3>
            <p className="text-xs text-text-muted mb-5 max-w-sm mx-auto">
              কোনো সমস্যা হলে ticket create করে আমাদের জানান
            </p>
            <Link
              href="/account/support/new"
              className="inline-flex items-center gap-2 bg-gradient-primary text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm"
            >
              <Plus className="w-4 h-4" />
              প্রথম Ticket তৈরি করুন
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => {
              const style = STATUS_STYLE[t.status] || STATUS_STYLE.OPEN;

              return (
                <Link
                  key={t.id}
                  href={`/account/support/${t.id}`}
                  className="block bg-bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <div className="font-mono text-[10px] text-primary font-bold truncate">
                            {t.ticketNo}
                          </div>
                          <div className="text-sm font-medium text-text-primary truncate mt-0.5">
                            {t.subject}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${style.bg}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      {t.lastMessage && (
                        <div className="text-xs text-text-muted truncate mt-1">
                          <span className="font-semibold">
                            {t.lastMessage.senderType === "ADMIN"
                              ? "Support: "
                              : "You: "}
                          </span>
                          {t.lastMessage.message}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="text-[10px] text-text-muted">
                          {t.messageCount} message ·{" "}
                          {new Date(t.lastReplyAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}