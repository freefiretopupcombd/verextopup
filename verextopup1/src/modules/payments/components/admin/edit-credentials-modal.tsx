"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { saveUddoktaPayCredentialsAction } from "../../actions";

type Props = {
  open: boolean;
  onClose: () => void;
  initialApiUrl: string;
  initialEnvironment: "sandbox" | "production";
};

const initialState = { success: false };

export function EditCredentialsModal({
  open,
  onClose,
  initialApiUrl,
  initialEnvironment,
}: Props) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [environment, setEnvironment] = useState(initialEnvironment);
  const [state, formAction, isPending] = useActionState(
    saveUddoktaPayCredentialsAction,
    initialState
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      setTimeout(onClose, 800);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setShowApiKey(false);
      setShowWebhookSecret(false);
      setEnvironment(initialEnvironment);
    }
  }, [open, initialEnvironment]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-bold text-text-primary text-lg">
              Edit UddoktaPay Credentials
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Credentials AES-256 encryption দিয়ে save হবে
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 hover:bg-bg-secondary rounded-lg transition"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="p-5 space-y-4">
          {/* Environment selector */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEnvironment("sandbox")}
                className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                  environment === "sandbox"
                    ? "bg-warning/10 border-warning text-warning"
                    : "bg-bg-secondary border-border text-text-muted hover:border-warning/50"
                }`}
              >
                🧪 Sandbox
              </button>
              <button
                type="button"
                onClick={() => setEnvironment("production")}
                className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                  environment === "production"
                    ? "bg-success/10 border-success text-success"
                    : "bg-bg-secondary border-border text-text-muted hover:border-success/50"
                }`}
              >
                🚀 Production
              </button>
            </div>
            <input
              type="hidden"
              name="environment"
              value={environment}
            />
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              API URL *
            </label>
            <input
              name="apiUrl"
              type="url"
              required
              defaultValue={initialApiUrl}
              placeholder="https://sandbox.uddoktapay.com"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg-card text-text-primary font-mono text-sm focus:outline-none focus:border-primary transition"
            />
            <p className="text-xs text-text-muted mt-1">
              Sandbox এর জন্য: <code>https://sandbox.uddoktapay.com</code>{" "}
              <br />
              Production এর জন্য: আপনার UddoktaPay panel URL
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              API Key *
            </label>
            <div className="relative">
              <input
                name="apiKey"
                type={showApiKey ? "text" : "password"}
                required
                placeholder="আপনার UddoktaPay API Key"
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-border bg-bg-card text-text-primary font-mono text-sm focus:outline-none focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">
              UddoktaPay panel → Brand Settings → API Settings থেকে নিন
            </p>
          </div>

          {/* Webhook Secret (optional) */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Webhook Secret (ঐচ্ছিক)
            </label>
            <div className="relative">
              <input
                name="webhookSecret"
                type={showWebhookSecret ? "text" : "password"}
                placeholder="Webhook verification এর জন্য (থাকলে)"
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-border bg-bg-card text-text-primary font-mono text-sm focus:outline-none focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
              >
                {showWebhookSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-info/5 border border-info/20 rounded-lg p-3">
            <p className="text-xs text-text-secondary">
              🔒 Credentials AES-256-GCM encryption দিয়ে database এ save হবে।
              Master key <code>.env</code> file এ থাকে, DB তে না।
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-gradient-primary text-white font-semibold px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Saving..." : "Save Credentials"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}