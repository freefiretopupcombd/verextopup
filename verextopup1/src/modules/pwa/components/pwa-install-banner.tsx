"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { usePWA } from "./pwa-provider";
import type { PWAConfig } from "../types";

const VISIT_KEY = "pwa_visit_count";

export function PWAInstallBanner({ config }: { config: PWAConfig }) {
  const { isInstallable, isInstalled, isIOS, promptInstall, dismiss, isDismissed } =
    usePWA();
  const [shouldShow, setShouldShow] = useState(false);
  const [iosInstructions, setIosInstructions] = useState(false);

  useEffect(() => {
    if (isInstalled || isDismissed) return;
    if (!config.enabled || !config.bannerEnabled) return;

    if (config.conditions.onlyMobile) {
      const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
      if (!isMobile) return;
    }

    const visits = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    if (visits < config.banner.showAfterVisits) return;

    const timer = setTimeout(() => {
      if (isInstallable || isIOS) setShouldShow(true);
    }, config.banner.delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [isInstallable, isIOS, isInstalled, isDismissed, config]);

  if (!shouldShow || isInstalled) return null;

  // ✅ Position — mobile এ support button (bottom-right) থেকে ডানে সরানো
  const positionClass =
    config.banner.position === "top"
      ? "top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md"
      : "bottom-4 left-4 right-16 sm:right-4 sm:left-auto sm:max-w-md";

  const handleInstall = async () => {
    if (isIOS) {
      setIosInstructions(true);
      return;
    }
    await promptInstall();
    setShouldShow(false);
  };

  const handleDismiss = () => {
    dismiss();
    setShouldShow(false);
  };

  // ---- iOS Modal ----
  if (iosInstructions) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/70 flex items-end sm:items-center justify-center p-4">
        <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md p-5">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-bold text-text-primary text-lg">
              {config.banner.titleEn || "Install App"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIosInstructions(false);
                setShouldShow(false);
              }}
              className="p-1 rounded-lg hover:bg-bg-secondary text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-text-muted mb-4">
            iPhone/iPad এ app install করতে নিচের steps follow করুন:
          </p>

          <div className="space-y-3">
            <IOSStep
              step={1}
              icon={<Share className="w-4 h-4" />}
              title="Share button চাপুন"
              desc="Safari browser এর নিচে বা উপরে Share icon"
            />
            <IOSStep
              step={2}
              icon={<Plus className="w-4 h-4" />}
              title='"Add to Home Screen"'
              desc="List থেকে এই option select করুন"
            />
            <IOSStep
              step={3}
              title='"Add" tap করুন'
              desc="App টা home screen এ add হবে"
            />
          </div>
        </div>
      </div>
    );
  }

  // ---- Main Banner — Compact mobile design ----
  return (
    <div
      className={`fixed ${positionClass} z-[9997] animate-in slide-in-from-bottom-5 fade-in duration-300`}
    >
      <div
        className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center gap-2.5 sm:gap-3 backdrop-blur-sm"
        style={{ borderColor: `${config.banner.buttonColor}66` }}
      >
        {/* Icon — smaller on mobile */}
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${config.banner.buttonColor}1A`,
            border: `1px solid ${config.banner.buttonColor}4D`,
          }}
        >
          <Download
            className="w-5 h-5 sm:w-6 sm:h-6"
            style={{ color: config.banner.buttonColor }}
          />
        </div>

        {/* Text — mobile এ single line truncated */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-text-primary text-xs sm:text-sm truncate">
            {config.banner.titleBn || config.banner.titleEn}
          </div>
          <div className="text-[10px] sm:text-xs text-text-muted mt-0.5 truncate">
            {config.banner.subtitleBn || config.banner.subtitleEn}
          </div>
        </div>

        {/* Install button — compact */}
        <button
          type="button"
          onClick={handleInstall}
          className="text-white font-bold text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition shrink-0 hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: config.banner.buttonColor }}
        >
          {config.banner.buttonTextBn || config.banner.buttonTextEn}
        </button>

        {/* Dismiss — smaller */}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 text-text-muted shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}

function IOSStep({
  step,
  icon,
  title,
  desc,
}: {
  step: number;
  icon?: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
        {step}
      </div>
      <div className="flex-1">
        <div className="text-sm text-text-primary font-medium flex items-center gap-1.5">
          {icon}
          {title}
        </div>
        <p className="text-xs text-text-muted mt-0.5">{desc}</p>
      </div>
    </div>
  );
}