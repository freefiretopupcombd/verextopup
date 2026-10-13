"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={i}
            className="bg-bg-card border border-border rounded-xl overflow-hidden transition"
          >
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-bg-secondary/50 transition"
            >
              <span className="font-medium text-text-primary text-sm">
                {item.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {open && (
              <div className="px-5 pb-4 pt-0 border-t border-border">
                <p className="text-sm text-text-secondary leading-relaxed pt-3">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}