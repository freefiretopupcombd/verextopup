"use client";

type Field = {
  id: string;
  label: string;
  name: string;
  fieldType: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  minLength: number | null;
  maxLength: number | null;
  regex: string | null;
  defaultValue: string | null;
  options: { label: string; value: string }[];
};

export function DynamicFieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const baseInput =
    "w-full px-4 py-3 rounded-lg border bg-card text-content placeholder:text-content-light focus:outline-none focus:ring-2 focus:border-transparent transition text-sm";
  const borderClass = error
    ? "border-error focus:ring-error"
    : "border-border focus:ring-primary";

  const common = {
    id: `field-${field.name}`,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder || "",
    minLength: field.minLength || undefined,
    maxLength: field.maxLength || undefined,
    pattern: field.regex || undefined,
    value,
    onChange: (e: any) => onChange(e.target.value),
    "aria-invalid": !!error,
  };

  return (
    <div>
      <label
        htmlFor={`field-${field.name}`}
        className="block text-sm font-medium text-content mb-1.5"
      >
        {field.label}
        {field.required && <span className="text-error ml-1">*</span>}
      </label>

      {/* Render based on type */}
      {field.fieldType === "text" || field.fieldType === "email" || field.fieldType === "tel" ? (
        <input
          {...common}
          type={field.fieldType === "email" ? "email" : field.fieldType === "tel" ? "tel" : "text"}
          className={`${baseInput} ${borderClass}`}
        />
      ) : field.fieldType === "number" ? (
        <input
          {...common}
          type="number"
          className={`${baseInput} ${borderClass}`}
        />
      ) : field.fieldType === "select" ? (
        <select
          {...common}
          className={`${baseInput} ${borderClass}`}
        >
          <option value="">— Select —</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.fieldType === "radio" ? (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => (
            <label
              key={opt.value}
              className={`px-4 py-2 rounded-lg border cursor-pointer transition text-sm ${
                value === opt.value
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border bg-card text-content hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
                required={field.required}
              />
              {opt.label}
            </label>
          ))}
        </div>
      ) : field.fieldType === "checkbox" ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            className="w-4 h-4 text-primary rounded"
          />
          <span className="text-sm text-content">{field.placeholder || field.label}</span>
        </label>
      ) : null}

      {/* Help text */}
      {field.helpText && !error && (
        <p className="mt-1.5 text-xs text-content-muted">{field.helpText}</p>
      )}

      {/* Error */}
      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}