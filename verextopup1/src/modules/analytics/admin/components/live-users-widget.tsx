"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

type LiveData = {
  last1min: number;
  last5min: number;
  loggedIn: number;
  guests: number;
};

export function LiveUsersWidget({ initial }: { initial: LiveData }) {
  const [data, setData] = useState<LiveData>(initial);
  // ⚠️ null initially — server এ render হবে না, client এ সবসময় set হবে
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLive = async () => {
      try {
        const res = await fetch("/api/admin/analytics/live", {
          cache: "no-store",
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(json);
          setLastUpdate(new Date());
        }
      } catch {}
    };

    const interval = setInterval(fetchLive, 15_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-primary/10 via-bg-card to-bg-card border border-primary/30 rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-success" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-success">
            Live Now
          </span>
        </div>
        <span className="text-[10px] text-text-muted">
          {mounted && lastUpdate
            ? lastUpdate.toLocaleTimeString()
            : "—"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-2xl font-bold text-text-primary">
            {data.last1min}
          </div>
          <div className="text-[10px] uppercase text-text-muted tracking-wider mt-0.5">
            Last 1 min
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-text-primary">
            {data.last5min}
          </div>
          <div className="text-[10px] uppercase text-text-muted tracking-wider mt-0.5">
            Last 5 min
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-success">
            {data.loggedIn}
          </div>
          <div className="text-[10px] uppercase text-text-muted tracking-wider mt-0.5">
            Logged In
          </div>
        </div>
      </div>
    </div>
  );
}