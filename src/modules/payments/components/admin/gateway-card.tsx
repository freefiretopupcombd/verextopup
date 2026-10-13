"use client";

import { useState, useTransition } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";

import {
  toggleUddoktaPayAction,
  testUddoktaPayAction,
} from "../../actions";
import { EditCredentialsModal } from "./edit-credentials-modal";

type GatewayCardProps = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  environment: "sandbox" | "production";
  apiUrl: string;
  apiKeyMasked: string;
  supports: string[];
};

export function GatewayCard({
  id,
  name,
  description,
  enabled: initialEnabled,
  configured,
  environment,
  apiUrl,
  apiKeyMasked,
  supports,
}: GatewayCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleToggle = () => {
    if (!configured) {
      toast.error("প্রথমে credentials configure করুন");
      setEditOpen(true);
      return;
    }

    const newState = !enabled;
    startTransition(async () => {
      const result = await toggleUddoktaPayAction(newState);
      if (result.success) {
        setEnabled(newState);
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await testUddoktaPayAction();

    setTestResult({
      success: result.success,
      message: result.message,
    });
    setTesting(false);

    if (result.success) {
      toast.success("Connection successful");
    } else {
      toast.error("Connection failed");
    }
  };

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-lg">{name}</h3>
              <p className="text-xs text-text-muted mt-0.5">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`relative w-14 h-8 rounded-full transition shrink-0 disabled:opacity-50 ${
              enabled ? "bg-success" : "bg-bg-secondary border border-border"
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all flex items-center justify-center ${
                enabled ? "left-7" : "left-1"
              }`}
            >
              {isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              )}
            </span>
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {!configured ? (
            <span className="inline-flex items-center gap-1 text-xs bg-danger/10 text-danger border border-danger/20 px-2 py-1 rounded">
              <XCircle className="w-3 h-3" />
              Not Configured
            </span>
          ) : enabled ? (
            <span className="inline-flex items-center gap-1 text-xs bg-success/10 text-success border border-success/20 px-2 py-1 rounded">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded">
              <XCircle className="w-3 h-3" />
              Disabled
            </span>
          )}

          {configured && (
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                environment === "sandbox"
                  ? "bg-warning/10 text-warning border-warning/20"
                  : "bg-success/10 text-success border-success/20"
              }`}
            >
              <Shield className="w-3 h-3" />
              {environment === "sandbox" ? "Sandbox" : "Production"}
            </span>
          )}
        </div>

        {/* Credentials */}
        <div className="bg-bg-secondary border border-border rounded-lg p-3 mb-4 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-text-muted">API URL</span>
            <span className="font-mono text-text-primary text-[11px] truncate max-w-[200px]">
              {apiUrl || "Not set"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-text-muted">API Key</span>
            <span className="font-mono text-text-primary text-[11px] truncate max-w-[200px]">
              {apiKeyMasked}
            </span>
          </div>
          <p className="text-[10px] text-text-muted pt-2 border-t border-border/50 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            AES-256 encrypted। Admin panel থেকে edit করা যাবে।
          </p>
        </div>

        {/* Supports */}
        <div className="mb-4">
          <p className="text-xs text-text-muted mb-2">Supports:</p>
          <div className="flex flex-wrap gap-1.5">
            {supports.map((s) => (
              <span
                key={s}
                className="text-[11px] bg-bg-secondary border border-border px-2 py-0.5 rounded text-text-secondary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs border ${
              testResult.success
                ? "bg-success/10 border-success/20 text-success"
                : "bg-danger/10 border-danger/20 text-danger"
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-primary text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Edit3 className="w-4 h-4" />
            Edit Credentials
          </button>

          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !configured}
            className="inline-flex items-center gap-2 bg-bg-secondary border border-border hover:border-primary text-text-primary text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {testing ? "Testing..." : "Test"}
          </button>

          <a
            href="https://uddoktapay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary transition ml-auto"
          >
            Docs
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCredentialsModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialApiUrl={apiUrl}
        initialEnvironment={environment}
      />
    </>
  );
}