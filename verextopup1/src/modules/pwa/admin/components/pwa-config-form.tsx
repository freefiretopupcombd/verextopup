"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  RotateCcw,
  Smartphone,
  Palette,
  MessageSquare,
  Image as ImageIcon,
  Filter,
  Eye,
} from "lucide-react";

import { savePWAConfigAction, resetPWAConfigAction } from "../../actions";
import type { PWAConfig } from "../../types";

import { AppInfoSection } from "./app-info-section";
import { BannerSection } from "./banner-section";
import { IconsSection } from "./icons-section";
import { ConditionsSection } from "./conditions-section";
import { LivePreview } from "./live-preview";

type Tab = "app" | "banner" | "icons" | "conditions" | "preview";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "app", label: "App Info", icon: Smartphone },
  { id: "banner", label: "Banner", icon: MessageSquare },
  { id: "icons", label: "Icons", icon: ImageIcon },
  { id: "conditions", label: "Conditions", icon: Filter },
  { id: "preview", label: "Live Preview", icon: Eye },
];

export function PWAConfigForm({ initial }: { initial: PWAConfig }) {
  const [config, setConfig] = useState<PWAConfig>(initial);
  const [activeTab, setActiveTab] = useState<Tab>("app");
  const [isPending, startTransition] = useTransition();
  const [isResetting, setIsResetting] = useState(false);

  const updateConfig = <K extends keyof PWAConfig>(
    key: K,
    value: PWAConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await savePWAConfigAction({ success: false }, formData);
      if (result.success) {
        toast.success(result.message || "Saved!");
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  const handleReset = async () => {
    if (!confirm("Default settings এ ফিরে যেতে চান?")) return;
    setIsResetting(true);
    try {
      const result = await resetPWAConfigAction();
      if (result.success) {
        toast.success(result.message);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Master toggles */}
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Toggle
            name="enabled"
            label="PWA Master Enable"
            description="সাইটের PWA feature সম্পূর্ণ চালু/বন্ধ"
            defaultChecked={config.enabled}
          />
          <Toggle
            name="bannerEnabled"
            label="Show Install Banner"
            description="Customer কে app install banner দেখান"
            defaultChecked={config.bannerEnabled}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-bg-card border border-border rounded-xl p-1.5 flex overflow-x-auto no-scrollbar gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                active
                  ? "bg-gradient-primary text-white"
                  : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content — hidden inputs for all fields always rendered */}
      {/* This keeps form data complete even when tab hidden */}
      <div className={activeTab === "app" ? "block" : "hidden"}>
        <AppInfoSection config={config} onChange={updateConfig} />
      </div>
      <div className={activeTab === "banner" ? "block" : "hidden"}>
        <BannerSection config={config} onChange={updateConfig} />
      </div>
      <div className={activeTab === "icons" ? "block" : "hidden"}>
        <IconsSection config={config} onChange={updateConfig} />
      </div>
      <div className={activeTab === "conditions" ? "block" : "hidden"}>
        <ConditionsSection config={config} onChange={updateConfig} />
      </div>
      <div className={activeTab === "preview" ? "block" : "hidden"}>
        <LivePreview config={config} />
      </div>

      {/* Sticky Save */}
      <div className="sticky bottom-4 bg-bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3 z-20">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "Saving..." : "Save Settings"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isResetting}
          className="px-4 py-3 rounded-lg border border-border text-text-secondary hover:bg-bg-secondary hover:text-danger transition text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isResetting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          Reset to Defaults
        </button>
        <p className="text-xs text-text-muted ml-auto">
          পরিবর্তন instant — customer reload করলে দেখবে
        </p>
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 mt-0.5 text-primary rounded"
      />
      <div>
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}