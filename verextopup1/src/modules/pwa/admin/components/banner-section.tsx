"use client";

import type { PWAConfig } from "../../types";

export function BannerSection({
  config,
  onChange,
}: {
  config: PWAConfig;
  onChange: <K extends keyof PWAConfig>(key: K, value: PWAConfig[K]) => void;
}) {
  const updateBanner = <K extends keyof PWAConfig["banner"]>(
    key: K,
    value: PWAConfig["banner"][K]
  ) => {
    onChange("banner", { ...config.banner, [key]: value });
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
        💬 Install Banner
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Title (English)">
          <input
            name="banner_titleEn"
            value={config.banner.titleEn}
            onChange={(e) => updateBanner("titleEn", e.target.value)}
            className={input()}
            maxLength={100}
          />
        </Field>
        <Field label="Title (বাংলা)">
          <input
            name="banner_titleBn"
            value={config.banner.titleBn}
            onChange={(e) => updateBanner("titleBn", e.target.value)}
            className={input()}
            maxLength={100}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Subtitle (English)">
          <input
            name="banner_subtitleEn"
            value={config.banner.subtitleEn}
            onChange={(e) => updateBanner("subtitleEn", e.target.value)}
            className={input()}
            maxLength={200}
          />
        </Field>
        <Field label="Subtitle (বাংলা)">
          <input
            name="banner_subtitleBn"
            value={config.banner.subtitleBn}
            onChange={(e) => updateBanner("subtitleBn", e.target.value)}
            className={input()}
            maxLength={200}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Button Text (English)">
          <input
            name="banner_buttonTextEn"
            value={config.banner.buttonTextEn}
            onChange={(e) => updateBanner("buttonTextEn", e.target.value)}
            className={input()}
            maxLength={30}
          />
        </Field>
        <Field label="Button Text (বাংলা)">
          <input
            name="banner_buttonTextBn"
            value={config.banner.buttonTextBn}
            onChange={(e) => updateBanner("buttonTextBn", e.target.value)}
            className={input()}
            maxLength={30}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Button Color">
          <div className="flex gap-2">
            <input
              type="color"
              value={config.banner.buttonColor}
              onChange={(e) => updateBanner("buttonColor", e.target.value)}
              className="w-12 h-10 rounded border border-border cursor-pointer"
            />
            <input
              name="banner_buttonColor"
              value={config.banner.buttonColor}
              onChange={(e) => updateBanner("buttonColor", e.target.value)}
              className={`${input()} font-mono`}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </Field>

        <Field label="Position">
          <select
            name="banner_position"
            value={config.banner.position}
            onChange={(e) => updateBanner("position", e.target.value as any)}
            className={input()}
          >
            <option value="bottom">Bottom</option>
            <option value="top">Top</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Delay" hint="seconds before showing">
          <input
            name="banner_delaySeconds"
            type="number"
            value={config.banner.delaySeconds}
            onChange={(e) =>
              updateBanner("delaySeconds", parseInt(e.target.value) || 0)
            }
            min={0}
            max={60}
            className={input()}
          />
        </Field>
        <Field label="Show After" hint="N visits">
          <input
            name="banner_showAfterVisits"
            type="number"
            value={config.banner.showAfterVisits}
            onChange={(e) =>
              updateBanner("showAfterVisits", parseInt(e.target.value) || 1)
            }
            min={1}
            max={20}
            className={input()}
          />
        </Field>
        <Field label="Dismiss Days" hint="hide after dismiss">
          <input
            name="banner_dismissDays"
            type="number"
            value={config.banner.dismissDays}
            onChange={(e) =>
              updateBanner("dismissDays", parseInt(e.target.value) || 1)
            }
            min={1}
            max={365}
            className={input()}
          />
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