"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { PWAConfig } from "../types";

type PWAContextType = {
  config: PWAConfig;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
  isDismissed: boolean;
};

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWA() {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error("usePWA must be used inside PWAProvider");
  return ctx;
}

const DISMISS_KEY = "pwa_install_dismissed_at";

export function PWAProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: PWAConfig;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ---- Check dismissal ----
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const daysAgo =
        (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
      setIsDismissed(daysAgo < config.banner.dismissDays);
    } else {
      setIsDismissed(false);
    }

    // ---- Detect iOS ----
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
    setIsIOS(ios && isSafari);

    // ---- Detect installed ----
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    // ---- beforeinstallprompt ----
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // ---- appinstalled ----
    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [config.banner.dismissDays]);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
  };

  return (
    <PWAContext.Provider
      value={{
        config,
        isInstallable,
        isInstalled,
        isIOS,
        promptInstall,
        dismiss,
        isDismissed,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}