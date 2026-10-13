"use client";

import { Zap, ShieldCheck, Headphones, Award } from "lucide-react";

const items = [
  {
    icon: Zap,
    title: "Instant Delivery",
    subtitle: "1-5 minutes",
    gradient: "from-amber-500/15 to-orange-500/5",
    iconBg: "from-amber-500 to-orange-500",
  },
  {
    icon: ShieldCheck,
    title: "100% Secure",
    subtitle: "SSL Encrypted",
    gradient: "from-emerald-500/15 to-green-500/5",
    iconBg: "from-emerald-500 to-green-500",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    subtitle: "Live Chat",
    gradient: "from-blue-500/15 to-cyan-500/5",
    iconBg: "from-blue-500 to-cyan-500",
  },
  {
    icon: Award,
    title: "Best Price",
    subtitle: "Compare & Save",
    gradient: "from-violet-500/15 to-purple-500/5",
    iconBg: "from-violet-500 to-purple-500",
  },
];

export function TrustBar() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`flex flex-col items-center text-center gap-1.5 p-2 sm:p-3 rounded-lg bg-gradient-to-br ${item.gradient} border border-white/5 hover:border-primary/30 transition-all`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-md`}
            >
              <Icon
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                strokeWidth={2.5}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-bold text-text-primary leading-tight">
                {item.title}
              </div>
              <div className="text-[8px] sm:text-[9px] text-text-muted leading-tight mt-0.5">
                {item.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}