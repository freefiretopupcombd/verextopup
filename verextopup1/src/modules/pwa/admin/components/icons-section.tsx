"use client";

import { Upload, X } from "lucide-react";
import type { PWAConfig, PWAIconData } from "../../types";

export function IconsSection({
  config,
  onChange,
}: {
  config: PWAConfig;
  onChange: <K extends keyof PWAConfig>(key: K, value: PWAConfig[K]) => void;
}) {
  const updateIcon = (
    key: keyof PWAConfig["icons"],
    data: PWAIconData
  ) => {
    onChange("icons", { ...config.icons, [key]: data });
  };

  const handleFileUpload = (
    key: keyof PWAConfig["icons"],
    file: File
  ) => {
    if (file.size > 100 * 1024) {
      // 100KB limit
      alert("File ১০০KB এর কম হতে হবে");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateIcon(key, { src: base64, type: "base64" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
        🖼️ App Icons
      </h3>

      <div className="bg-info/5 border border-info/20 rounded-lg p-3 text-xs text-text-secondary">
        💡 <strong>Tip:</strong> PNG square icon upload করুন। Recommended: 192×192, 512×512। Icon ছাড়া install prompt কাজ করবে না।
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IconUploader
          label="Icon 192×192"
          hint="Standard icon"
          value={config.icons.icon192}
          onChange={(data) => updateIcon("icon192", data)}
          inputName="icon_192"
          onFileUpload={(file) => handleFileUpload("icon192", file)}
        />
        <IconUploader
          label="Icon 512×512"
          hint="Large icon (required)"
          value={config.icons.icon512}
          onChange={(data) => updateIcon("icon512", data)}
          inputName="icon_512"
          onFileUpload={(file) => handleFileUpload("icon512", file)}
        />
        <IconUploader
          label="Maskable 192×192"
          hint="Android adaptive icon"
          value={config.icons.maskable192}
          onChange={(data) => updateIcon("maskable192", data)}
          inputName="icon_maskable192"
          onFileUpload={(file) => handleFileUpload("maskable192", file)}
        />
        <IconUploader
          label="Maskable 512×512"
          hint="Android adaptive (large)"
          value={config.icons.maskable512}
          onChange={(data) => updateIcon("maskable512", data)}
          inputName="icon_maskable512"
          onFileUpload={(file) => handleFileUpload("maskable512", file)}
        />
        <IconUploader
          label="Apple Touch Icon"
          hint="iOS home screen (180×180)"
          value={config.icons.apple}
          onChange={(data) => updateIcon("apple", data)}
          inputName="icon_apple"
          onFileUpload={(file) => handleFileUpload("apple", file)}
        />
      </div>
    </div>
  );
}

function IconUploader({
  label,
  hint,
  value,
  onChange,
  inputName,
  onFileUpload,
}: {
  label: string;
  hint: string;
  value: PWAIconData;
  onChange: (data: PWAIconData) => void;
  inputName: string;
  onFileUpload: (file: File) => void;
}) {
  const hasIcon = !!value.src;

  return (
    <div className="bg-bg-secondary rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-text-primary">{label}</div>
          <div className="text-[10px] text-text-muted">{hint}</div>
        </div>
        {hasIcon && (
          <button
            type="button"
            onClick={() => onChange({ src: "", type: "url" })}
            className="p-1 rounded hover:bg-danger/10 text-text-muted hover:text-danger"
            title="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Preview + Upload */}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
          {hasIcon ? (
            <img
              src={value.src}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <Upload className="w-5 h-5 text-text-muted" />
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <label className="block">
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(file);
              }}
              className="hidden"
            />
            <span className="block text-center text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-lg cursor-pointer transition">
              Choose File
            </span>
          </label>
          <p className="text-[10px] text-text-muted text-center">
            PNG/SVG · max 100KB
          </p>
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name={`${inputName}_src`} value={value.src} />
      <input type="hidden" name={`${inputName}_type`} value={value.type} />

      {/* Optional URL input */}
      <details className="text-xs">
        <summary className="text-text-muted cursor-pointer hover:text-primary">
          অথবা URL দিয়ে দিন
        </summary>
        <input
          type="text"
          value={value.type === "url" ? value.src : ""}
          onChange={(e) => onChange({ src: e.target.value, type: "url" })}
          placeholder="https://example.com/icon-192.png"
          className="w-full mt-1.5 px-2 py-1.5 rounded border border-border bg-bg-card text-text-primary text-xs focus:outline-none focus:border-primary"
        />
      </details>
    </div>
  );
}