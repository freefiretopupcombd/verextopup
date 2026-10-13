"use client";

import { Download, X } from "lucide-react";
import type { PWAConfig } from "../../types";

export function LivePreview({ config }: { config: PWAConfig }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
        👁️ Live Preview
      </h3>

      {/* Banner preview */}
      <div className="bg-bg-primary/50 rounded-2xl p-4 min-h-[200px] flex items-end justify-center">
        <div className="w-full max-w-md">
          {config.bannerEnabled ? (
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border rounded-2xl p-3 shadow-2xl flex items-center gap-3"
              style={{ borderColor: `${config.banner.buttonColor}66` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${config.banner.buttonColor}1A`,
                  border: `1px solid ${config.banner.buttonColor}4D`,
                }}
              >
                <Download
                  className="w-6 h-6"
                  style={{ color: config.banner.buttonColor }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-text-primary text-sm">
                  {config.banner.titleBn || config.banner.titleEn}
                </div>
                <div className="text-xs text-text-muted mt-0.5 truncate">
                  {config.banner.subtitleBn || config.banner.subtitleEn}
                </div>
              </div>
              <button
                type="button"
                className="text-white font-bold text-sm px-4 py-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: config.banner.buttonColor }}
              >
                {config.banner.buttonTextBn || config.banner.buttonTextEn}
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center text-text-muted text-sm py-8">
              Banner disabled
            </div>
          )}
        </div>
      </div>

      {/* Config summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <PreviewStat label="Status" value={config.enabled ? "Enabled" : "Disabled"} color={config.enabled ? "text-success" : "text-danger"} />
        <PreviewStat label="Position" value={config.banner.position} />
        <PreviewStat label="Delay" value={`${config.banner.delaySeconds}s`} />
        <PreviewStat label="After" value={`${config.banner.showAfterVisits} visits`} />
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  color = "text-text-primary",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-bg-secondary rounded-lg p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className={`text-sm font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}