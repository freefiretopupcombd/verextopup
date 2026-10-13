"use client";

import { Plus, Trash2, Copy, GripVertical, X } from "lucide-react";

import { generateFieldName } from "../validations";

export type FieldOption = {
  label: string;
  value: string;
};

export type ProductField = {
  id?: string;
  label: string;
  name: string;
  fieldType:
    | "text"
    | "number"
    | "email"
    | "tel"
    | "select"
    | "radio"
    | "checkbox";
  placeholder: string;
  helpText: string;
  required: boolean;
  minLength: number | string;
  maxLength: number | string;
  regex: string;
  defaultValue: string;
  sortOrder: number;
  options: FieldOption[];
};

export function FieldBuilder({
  fields,
  onChange,
}: {
  fields: ProductField[];
  onChange: (f: ProductField[]) => void;
}) {
  const add = () => {
    onChange([
      ...fields,
      {
        label: "",
        name: "",
        fieldType: "text",
        placeholder: "",
        helpText: "",
        required: true,
        minLength: "",
        maxLength: "",
        regex: "",
        defaultValue: "",
        sortOrder: fields.length,
        options: [],
      },
    ]);
  };

  const update = (index: number, patch: Partial<ProductField>) => {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const remove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const duplicate = (index: number) => {
    const copy = {
      ...fields[index],
      label: fields[index].label + " (copy)",
      name: fields[index].name + "_copy",
      options: [...fields[index].options],
    };
    onChange([...fields.slice(0, index + 1), copy, ...fields.slice(index + 1)]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...fields];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const next = [...fields];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const handleLabelChange = (index: number, label: string) => {
    const currentName = fields[index].name;
    const autoName =
      !currentName || currentName === generateFieldName(fields[index].label);
    update(index, {
      label,
      name: autoName ? generateFieldName(label) : currentName,
    });
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    update(fieldIndex, {
      options: [...field.options, { label: "", value: "" }],
    });
  };

  const updateOption = (
    fieldIndex: number,
    optIndex: number,
    patch: Partial<FieldOption>
  ) => {
    const field = fields[fieldIndex];
    const newOptions = field.options.map((o, i) =>
      i === optIndex ? { ...o, ...patch } : o
    );
    update(fieldIndex, { options: newOptions });
  };

  const removeOption = (fieldIndex: number, optIndex: number) => {
    const field = fields[fieldIndex];
    update(fieldIndex, {
      options: field.options.filter((_, i) => i !== optIndex),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-content-muted">
          মোট {fields.length} টা field
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </div>

      {fields.length === 0 && (
        <div className="bg-muted rounded-lg p-6 text-center border border-dashed border-border">
          <p className="text-content-muted text-sm">
            Customer-এর কাছ থেকে অতিরিক্ত তথ্য নিতে চাইলে field যোগ করুন
            (যেমন Player ID, Server ID)।
          </p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((f, i) => {
          const hasOptions =
            f.fieldType === "select" || f.fieldType === "radio";

          return (
            <div
              key={i}
              className="bg-muted rounded-lg p-4 border border-border"
            >
              {/* Row header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-content-muted">
                  <GripVertical className="w-4 h-4" />
                  <span className="text-xs font-mono">Field #{i + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="p-1.5 rounded hover:bg-card text-content-muted disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === fields.length - 1}
                    className="p-1.5 rounded hover:bg-card text-content-muted disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicate(i)}
                    className="p-1.5 rounded hover:bg-card text-content-muted hover:text-primary"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="p-1.5 rounded hover:bg-error/10 text-content-muted hover:text-error"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label>Label *</Label>
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => handleLabelChange(i, e.target.value)}
                    placeholder="Player ID"
                    className={input}
                  />
                </div>

                <div>
                  <Label>Field Name * (lowercase)</Label>
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                    placeholder="player_id"
                    className={`${input} font-mono text-xs`}
                  />
                </div>

                <div>
                  <Label>Type *</Label>
                  <select
                    value={f.fieldType}
                    onChange={(e) =>
                      update(i, {
                        fieldType: e.target.value as ProductField["fieldType"],
                      })
                    }
                    className={input}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="select">Dropdown</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <Label>Placeholder</Label>
                  <input
                    type="text"
                    value={f.placeholder}
                    onChange={(e) => update(i, { placeholder: e.target.value })}
                    placeholder="যেমন: 1234567890"
                    className={input}
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) =>
                        update(i, { required: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-content">Required</span>
                  </label>
                </div>

                <div>
                  <Label>Min length</Label>
                  <input
                    type="number"
                    value={f.minLength}
                    onChange={(e) => update(i, { minLength: e.target.value })}
                    placeholder="0"
                    className={input}
                  />
                </div>

                <div>
                  <Label>Max length</Label>
                  <input
                    type="number"
                    value={f.maxLength}
                    onChange={(e) => update(i, { maxLength: e.target.value })}
                    placeholder="optional"
                    className={input}
                  />
                </div>

                <div>
                  <Label>Default value</Label>
                  <input
                    type="text"
                    value={f.defaultValue}
                    onChange={(e) =>
                      update(i, { defaultValue: e.target.value })
                    }
                    placeholder="optional"
                    className={input}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <Label>Help text (customer-কে দেখানো হবে)</Label>
                  <input
                    type="text"
                    value={f.helpText}
                    onChange={(e) => update(i, { helpText: e.target.value })}
                    placeholder="যেমন: আপনার Free Fire ID দিন"
                    className={input}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <Label>Regex validation (advanced, optional)</Label>
                  <input
                    type="text"
                    value={f.regex}
                    onChange={(e) => update(i, { regex: e.target.value })}
                    placeholder="যেমন: ^[0-9]{8,12}$"
                    className={`${input} font-mono text-xs`}
                  />
                </div>
              </div>

              {/* Options (for select/radio) */}
              {hasOptions && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Options *</Label>
                    <button
                      type="button"
                      onClick={() => addOption(i)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {f.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className="flex items-center gap-2 bg-card rounded p-2 border border-border"
                      >
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) =>
                            updateOption(i, oi, {
                              label: e.target.value,
                              value: opt.value || generateFieldName(e.target.value),
                            })
                          }
                          placeholder="Label (যেমন: Asia)"
                          className="flex-1 px-2 py-1 text-sm rounded border border-border bg-card"
                        />
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) =>
                            updateOption(i, oi, { value: e.target.value })
                          }
                          placeholder="value"
                          className="flex-1 px-2 py-1 text-sm rounded border border-border bg-card font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(i, oi)}
                          className="p-1 rounded hover:bg-error/10 text-content-muted hover:text-error"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {f.options.length === 0 && (
                      <p className="text-xs text-content-muted italic">
                        এখনো কোনো option নেই
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const input =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-content-muted mb-1">
      {children}
    </label>
  );
}