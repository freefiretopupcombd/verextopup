"use client";

import { useState, useTransition } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendNotificationAction } from "../actions";

type User = {
  id: string;
  email: string;
  name: string | null;
};

export function SendNotificationModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit =
    title.trim().length >= 3 &&
    message.trim().length >= 5 &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.set("userId", user.id);
    fd.set("title", title);
    fd.set("message", message);
    fd.set("link", link);

    startTransition(async () => {
      const result = await sendNotificationAction({ success: false }, fd);
      if (result.success) {
        toast.success("Notification পাঠানো হয়েছে");
        onClose();
      } else {
        toast.error(result.message || "ব্যর্থ");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-text-primary">Send Notification</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Recipient
            </div>
            <div className="text-sm font-medium text-text-primary mt-0.5">
              {user.name || user.email}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: Special Offer!"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary text-sm"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Message *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification এর বিস্তারিত..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary resize-none text-sm"
              maxLength={2000}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Link (optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/products বা full URL"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary text-sm"
              maxLength={500}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-primary hover:bg-bg-secondary transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}