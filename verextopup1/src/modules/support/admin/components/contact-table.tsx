"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Eye,
  X,
  CheckCircle2,
  Archive,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { updateContactStatusAction } from "../../actions";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-primary/15 text-primary",
  READ: "bg-warning/15 text-warning",
  REPLIED: "bg-success/15 text-success",
  ARCHIVED: "bg-text-muted/15 text-text-muted",
};

export function ContactTable({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Contact | null>(null);

  const handleStatus = (
    contactId: string,
    status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
  ) => {
    startTransition(async () => {
      const result = await updateContactStatusAction(contactId, status);
      if (result.success) {
        toast.success("Updated");
        router.refresh();
        setSelected(null);
      } else {
        toast.error("Failed");
      }
    });
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
        <Mail className="w-10 h-10 text-text-dim mx-auto mb-3" />
        <p className="text-text-muted text-sm">কোনো message নেই</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="w-full text-left p-4 hover:bg-bg-secondary/50 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {c.subject}
                  </div>
                  <div className="text-xs text-text-muted truncate mt-0.5">
                    {c.name} · {c.email}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[c.status]}`}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-1 mt-1">
                {c.message}
              </p>
              <div className="text-[10px] text-text-muted mt-1.5">
                {new Date(c.createdAt).toLocaleString("en-GB")}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border rounded-xl max-w-2xl w-full my-8">
            <div className="flex items-start justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-bold text-text-primary">
                  {selected.subject}
                </h3>
                <div className="text-xs text-text-muted mt-1">
                  From: {selected.name} &lt;{selected.email}&gt;
                </div>
                {selected.phone && (
                  <div className="text-xs text-text-muted">
                    Phone: {selected.phone}
                  </div>
                )}
                <div className="text-xs text-text-muted mt-1">
                  {new Date(selected.createdAt).toLocaleString("en-GB")}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="bg-bg-secondary rounded-lg p-4 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>
            </div>

            <div className="p-5 border-t border-border flex flex-wrap gap-2 justify-end">
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary border border-border hover:border-primary text-text-primary text-sm font-medium transition"
              >
                <Mail className="w-4 h-4" />
                Reply via Email
              </a>
              <button
                onClick={() => handleStatus(selected.id, "REPLIED")}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success hover:bg-success/90 text-white text-sm font-medium transition disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Mark Replied
              </button>
              <button
                onClick={() => handleStatus(selected.id, "ARCHIVED")}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary border border-border hover:border-primary text-text-primary text-sm font-medium transition disabled:opacity-60"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}