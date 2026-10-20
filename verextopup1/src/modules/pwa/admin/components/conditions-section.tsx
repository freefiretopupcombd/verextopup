"use client";

import type { PWAConfig } from "../../types";

export function ConditionsSection({
  config,
  onChange,
}: {
  config: PWAConfig;
  onChange: <K extends keyof PWAConfig>(key: K, value: PWAConfig[K]) => void;
}) {
  const updateConditions = <K extends keyof PWAConfig["conditions"]>(
    key: K,
    value: PWAConfig["conditions"][K]
  ) => {
    onChange("conditions", { ...config.conditions, [key]: value });
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
        🎯 Display Conditions
      </h3>

      <div className="space-y-3">
        <Toggle
          name="cond_onlyMobile"
          label="Only on Mobile Devices"
          description="Desktop/tablet এ banner দেখাবে না"
          checked={config.conditions.onlyMobile}
          onChange={(v) => updateConditions("onlyMobile", v)}
        />
        <Toggle
          name="cond_onlyLoggedIn"
          label="Only Logged-in Users"
          description="Guest user দের দেখাবে না"
          checked={config.conditions.onlyLoggedIn}
          onChange={(v) => updateConditions("onlyLoggedIn", v)}
        />
        <Toggle
          name="cond_onlyNewUsers"
          label="Only New Users"
          description="যাদের কোনো order নেই তাদের দেখাবে"
          checked={config.conditions.onlyNewUsers}
          onChange={(v) => updateConditions("onlyNewUsers", v)}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">
          Show on Pages
        </label>
        <select
          name="cond_pages"
          value={config.conditions.pages}
          onChange={(e) => updateConditions("pages", e.target.value as any)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary text-sm"
        >
          <option value="all">All Pages</option>
          <option value="home">Only Homepage</option>
          <option value="products">Only Product Pages</option>
          <option value="custom">Custom Paths</option>
        </select>
      </div>

      {config.conditions.pages === "custom" && (
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Custom Paths (comma-separated)
          </label>
          <input
            name="cond_customPaths"
            value={config.conditions.customPaths}
            onChange={(e) => updateConditions("customPaths", e.target.value)}
            placeholder="/products, /account/wallet, /categories"
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary text-sm"
          />
          <p className="text-[10px] text-text-muted mt-1">
            উদাহরণ: <code>/products, /account/*</code>
          </p>
        </div>
      )}
    </div>
  );
}

function Toggle({
  name,
  label,
  description,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
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