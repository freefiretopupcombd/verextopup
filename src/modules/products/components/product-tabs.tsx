"use client";

import { useState, ReactNode } from "react";

type TabId = "description" | "how" | "reviews";

export function ProductTabs({
  description,
  howItWorks,
  reviews,
  reviewCount,
  keyFeatures,
}: {
  description: ReactNode;
  howItWorks: ReactNode;
  reviews: ReactNode;
  reviewCount: number;
  keyFeatures?: {
    game: string;
    type: string;
    delivery: string;
    region: string;
    availability: string;
  };
}) {
  const [active, setActive] = useState<TabId>("description");

  const tabs = [
    { id: "description" as TabId, label: "Product Description" },
    { id: "how" as TabId, label: "How It Works" },
    {
      id: "reviews" as TabId,
      label: `Reviews (${reviewCount.toLocaleString()})`,
    },
  ];

  return (
    <div>
      {/* Tab headers */}
      <div className="border-b border-border overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`py-3 text-sm font-medium whitespace-nowrap transition relative ${
                  isActive
                    ? "text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-bg-card border border-t-0 border-border rounded-b-xl p-5 sm:p-6">
        {active === "description" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Description */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {description}
              </div>
            </div>

            {/* Right: Key Features */}
            {keyFeatures && (
              <div className="lg:col-span-1">
                <div className="bg-bg-secondary border border-border rounded-lg p-4">
                  <h4 className="text-sm font-bold text-text-primary mb-3">
                    Key Features
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <FeatureRow icon="🎮" label="Game" value={keyFeatures.game} />
                    <FeatureRow icon="💎" label="Type" value={keyFeatures.type} />
                    <FeatureRow icon="🚀" label="Delivery" value={keyFeatures.delivery} />
                    <FeatureRow icon="🌍" label="Region" value={keyFeatures.region} />
                    <FeatureRow
                      icon="✓"
                      label="Availability"
                      value={keyFeatures.availability}
                      highlight
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {active === "how" && <div>{howItWorks}</div>}
        {active === "reviews" && <div>{reviews}</div>}
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-text-muted">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span
        className={`font-medium text-right ${
          highlight ? "text-success" : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}