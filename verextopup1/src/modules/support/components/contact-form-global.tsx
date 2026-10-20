"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitGlobalContactAction } from "../actions";

export function ContactFormGlobal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canSubmit =
    name.trim().length >= 2 &&
    email.includes("@") &&
    subject.trim().length >= 3 &&
    message.trim().length >= 10 &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    fd.set("subject", subject);
    fd.set("message", message);
    fd.set("phone", phone);

    startTransition(async () => {
      const result = await submitGlobalContactAction(fd);
      if (result.success) {
        setSubmitted(true);
        toast.success("Message পাঠানো হয়েছে!");
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  if (submitted) {
    return (
      <div className="bg-bg-card border border-success/30 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">
          Message পাঠানো হয়েছে! 🎉
        </h3>
        <p className="text-sm text-text-muted">
          আমরা ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব।
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 text-sm text-primary hover:underline font-medium"
        >
          আরেকটা message পাঠান
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-text-primary">
          আমাদের একটি Message পাঠান
        </h2>
        <p className="text-text-muted text-sm mt-1">
          আমরা ২৪ ঘন্টার মধ্যে reply দেব
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="আপনার নাম *">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={inputCls}
              required
              maxLength={100}
            />
          </Field>
          <Field label="Email *">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
              required
              maxLength={200}
            />
          </Field>
        </div>

        <Field label="Phone (optional)">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+880 1XXX XXXXXX"
            className={inputCls}
            maxLength={30}
          />
        </Field>

        <Field label="Subject *">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="সংক্ষেপে আপনার সমস্যা লিখুন"
            className={inputCls}
            required
            maxLength={200}
          />
        </Field>

        <Field label={`Message * (${message.length}/2000)`}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="বিস্তারিত লিখুন..."
            rows={5}
            className={`${inputCls} resize-none`}
            required
            maxLength={2000}
          />
        </Field>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-xl transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isPending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-border bg-bg-secondary text-text-primary text-sm focus:outline-none focus:border-primary transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}