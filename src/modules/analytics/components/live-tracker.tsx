"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackHeartbeat } from "../actions";

export function LiveTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith("/admin")) return;

    const send = () => {
      trackHeartbeat(pathname).catch(() => {});
    };

    // Initial ping
    send();

    // Every 30 seconds
    const interval = setInterval(send, 30_000);

    // Also ping on visibility change (when tab becomes active)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") send();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname]);

  return null;
}