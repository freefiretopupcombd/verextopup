"use client";

type Field = {
  id: string;
  label: string;
  name: string;
  fieldType: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  options: { label: string; value: string }[];
};

export function AccountInfoFields({
  fields,
  values,
  onChange,
  errors,
}: {
  fields: Field[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  errors: Record<string, string>;
}) {
  if (fields.length === 0) return null;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-3.5 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
          2
        </div>
        <h2 className="font-bold text-text-primary text-sm sm:text-base">
          Account Info
        </h2>
      </div>

      <div className="space-y-2.5">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-xs font-medium text-text-primary mb-1">
              {field.label}
              {field.required && (
                <span className="text-danger ml-0.5">*</span>
              )}
            </label>

            {field.fieldType === "select" && field.options.length > 0 ? (
              <select
                value={values[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-bg-secondary border text-sm text-text-primary focus:outline-none focus:border-primary transition ${
                  errors[field.name] ? "border-danger" : "border-border"
                }`}
              >
                <option value="">
                  {field.placeholder || `Select ${field.label}`}
                </option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.fieldType === "number" ? "number" : "text"}
                value={values[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label}`}
                className={`w-full px-3 py-2 rounded-lg bg-bg-secondary border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition ${
                  errors[field.name] ? "border-danger" : "border-border"
                }`}
              />
            )}

            {field.helpText && !errors[field.name] && (
              <p className="mt-1 text-[10px] text-text-dim">
                {field.helpText}
              </p>
            )}

            {errors[field.name] && (
              <p className="mt-1 text-[11px] text-danger">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}