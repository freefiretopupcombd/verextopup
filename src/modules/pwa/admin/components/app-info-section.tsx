"use client";

import type { PWAConfig } from "../../types";

export function AppInfoSection({
  config,
  onChange,
}: {
  config: PWAConfig;
  onChange: <K extends keyof PWAConfig>(key: K, value: PWAConfig[K]) => void;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
        📱 App Information
      </h3>

      <Field label="App Name" hint="Full name (max 100 chars)">
        <input
          name="name"
          value={config.name}
          onChange={(e) => onChange("name", e.target.value)}
          className={input()}
          maxLength={100}
          required
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Short Name" hint="Home screen icon (max 30 chars)">
          <input
            name="shortName"
            value={config.shortName}
            onChange={(e) => onChange("shortName", e.target.value)}
            className={input()}
            maxLength={30}
            required
          />
        </Field>

        <Field label="Language">
          <select
            name="lang"
            value={config.lang}
            onChange={(e) => onChange("lang", e.target.value)}
            className={input()}
          >
            <option value="bn-BD">বাংলা (bn-BD)</option>
            <option value="en-US">English (en-US)</option>
            <option value="en">English</option>
          </select>
        </Field>
      </div>

      <Field label="Description" hint="Max 300 chars">
        <textarea
          name="description"
          value={config.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          className={`${input()} resize-none`}
          maxLength={300}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Theme Color">
          <div className="flex gap-2">
            <input
              type="color"
              value={config.themeColor}
              onChange={(e) => onChange("themeColor", e.target.value)}
              className="w-12 h-10 rounded border border-border cursor-pointer"
            />
            <input
              name="themeColor"
              value={config.themeColor}
              onChange={(e) => onChange("themeColor", e.target.value)}
              className={`${input()} font-mono`}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </Field>

        <Field label="Background Color">
          <div className="flex gap-2">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => onChange("backgroundColor", e.target.value)}
              className="w-12 h-10 rounded border border-border cursor-pointer"
            />
            <input
              name="backgroundColor"
              value={config.backgroundColor}
              onChange={(e) => onChange("backgroundColor", e.target.value)}
              className={`${input()} font-mono`}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Display Mode">
          <select
            name="display"
            value={config.display}
            onChange={(e) => onChange("display", e.target.value as any)}
            className={input()}
          >
            <option value="standalone">Standalone (recommended)</option>
            <option value="fullscreen">Fullscreen</option>
            <option value="minimal-ui">Minimal UI</option>
            <option value="browser">Browser</option>
          </select>
        </Field>

        <Field label="Orientation">
          <select
            name="orientation"
            value={config.orientation}
            onChange={(e) => onChange("orientation", e.target.value as any)}
            className={input()}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
            <option value="any">Any</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function input() {
  return "w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-primary transition text-sm";
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">
        {label}
        {hint && <span className="text-text-dim ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}