"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/ui/image-upload";
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
  type ActionState,
} from "../actions";
import {
  generatePaymentSlug,
  generateFieldName,
} from "../validations";

type InputField = {
  label: string;
  name: string;
  fieldType: "text" | "number" | "email" | "tel" | "textarea";
  placeholder: string;
  helpText: string;
  required: boolean;
  sortOrder: number;
  role?: "NONE" | "SENDER_NUMBER" | "TRANSACTION_ID";
};

type FormProps = {
  mode: "create" | "edit";
  paymentId?: string;
  initialData?: {
    name: string;
    slug: string;
    type: string;
    logo: string | null;
    accountNumber: string | null;
    merchantNumber: string | null;
    instructions: string | null;
    requireTxnId: boolean;
    requireScreenshot: boolean;
    minAmount: number | null;
    maxAmount: number | null;
    status: string;
    sortOrder: number;
    inputFields: InputField[];
  };
};

const initialState: ActionState = { success: false };

export function PaymentForm({ mode, paymentId, initialData }: FormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [inputFields, setInputFields] = useState<InputField[]>(
    initialData?.inputFields || []
  );
  const [logo, setLogo] = useState(initialData?.logo || "");

  const action = paymentId
    ? updatePaymentMethodAction.bind(null, paymentId)
    : createPaymentMethodAction;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Success!");
      router.push("/admin/payments");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) setSlug(generatePaymentSlug(val));
  };

  const addField = () => {
    setInputFields([
      ...inputFields,
      {
        label: "",
        name: "",
        fieldType: "text",
        placeholder: "",
        helpText: "",
        required: true,
        sortOrder: inputFields.length,
        role: "NONE",
      },
    ]);
  };

  const updateField = (index: number, patch: Partial<InputField>) => {
    setInputFields(
      inputFields.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  };

  const removeField = (index: number) => {
    setInputFields(inputFields.filter((_, i) => i !== index));
  };

  const duplicateField = (index: number) => {
    const copy = {
      ...inputFields[index],
      label: inputFields[index].label + " (copy)",
      name: inputFields[index].name + "_copy",
    };
    setInputFields([
      ...inputFields.slice(0, index + 1),
      copy,
      ...inputFields.slice(index + 1),
    ]);
  };

  const handleFieldLabelChange = (index: number, label: string) => {
    const currentName = inputFields[index].name;
    const autoName =
      !currentName ||
      currentName === generateFieldName(inputFields[index].label);
    updateField(index, {
      label,
      name: autoName ? generateFieldName(label) : currentName,
    });
  };

  const d = initialData;

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="inputFields"
        value={JSON.stringify(inputFields)}
      />
      <input type="hidden" name="logo" value={logo} />

      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Method Name *" error={state.errors?.name?.[0]}>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="যেমন: bKash, Nagad"
              className={input()}
            />
          </Field>

          <Field label="Slug *" error={state.errors?.slug?.[0]}>
            <input
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="bkash"
              className={`${input()} font-mono text-sm`}
            />
          </Field>

          <Field label="Type *">
            <select
              name="type"
              defaultValue={d?.type || "MANUAL"}
              className={input()}
            >
              <option value="MANUAL">Manual (customer submits proof)</option>
              <option value="AUTOMATIC">Automatic (gateway)</option>
            </select>
          </Field>

          {/* ✅ Payment Logo Upload */}
          <div className="sm:col-span-2">
            <ImageUpload
              label="Payment Method Logo"
              value={logo}
              onChange={(url) => setLogo(url)}
            />
          </div>
        </div>
      </Section>

      {/* Payment Details */}
      <Section title="Payment Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Account Number">
            <input
              name="accountNumber"
              type="text"
              defaultValue={d?.accountNumber || ""}
              placeholder="01700-000000"
              className={`${input()} font-mono`}
            />
          </Field>

          <Field label="Merchant Number">
            <input
              name="merchantNumber"
              type="text"
              defaultValue={d?.merchantNumber || ""}
              placeholder="Merchant number (ঐচ্ছিক)"
              className={`${input()} font-mono`}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Instructions (customer-কে দেখানো হবে)">
            <textarea
              name="instructions"
              rows={4}
              defaultValue={d?.instructions || ""}
              placeholder="যেমন: উপরের number-এ Send Money করুন..."
              className={`${input()} resize-none`}
            />
          </Field>
        </div>
      </Section>

      {/* CUSTOM INPUT FIELDS */}
      <Section title="Required Input Fields">
        <p className="text-xs text-text-muted mb-4">
          Customer-এর কাছ থেকে কী কী তথ্য নেবেন সেটা define করুন। প্রতিটা
          field-এর <strong className="text-text-primary">Role</strong>{" "}
          select করলে system সেটা automatically চিনবে (যেমন Sender Number,
          Transaction ID)।
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-text-muted">
            {inputFields.length} টা field
          </span>
          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center gap-2 bg-gradient-primary text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Field
          </button>
        </div>

        {inputFields.length === 0 && (
          <div className="bg-bg-secondary rounded-lg p-6 text-center border border-dashed border-border">
            <p className="text-xs text-text-muted">
              এখনো কোনো field নেই। "Add Field" ক্লিক করুন।
            </p>
          </div>
        )}

        <div className="space-y-3">
          {inputFields.map((field, i) => (
            <div
              key={i}
              className="bg-bg-secondary rounded-lg p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-text-muted">
                  Field #{i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => duplicateField(i)}
                    className="p-1.5 rounded hover:bg-bg-card text-text-muted hover:text-primary"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Label *</Label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldLabelChange(i, e.target.value)
                    }
                    placeholder="Transaction ID"
                    className={smallInput()}
                  />
                </div>

                <div>
                  <Label>Field Name *</Label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      updateField(i, { name: e.target.value })
                    }
                    placeholder="transaction_id"
                    className={`${smallInput()} font-mono text-xs`}
                  />
                </div>

                <div>
                  <Label>Field Type</Label>
                  <select
                    value={field.fieldType}
                    onChange={(e) =>
                      updateField(i, {
                        fieldType: e.target.value as InputField["fieldType"],
                      })
                    }
                    className={smallInput()}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </div>

                <div>
                  <Label>
                    Field Role{" "}
                    <span className="text-primary">(important)</span>
                  </Label>
                  <select
                    value={field.role || "NONE"}
                    onChange={(e) =>
                      updateField(i, {
                        role: e.target.value as InputField["role"],
                      })
                    }
                    className={`${smallInput()} ${
                      field.role && field.role !== "NONE"
                        ? "border-primary/50 bg-primary/5"
                        : ""
                    }`}
                  >
                    <option value="NONE">None (regular field)</option>
                    <option value="SENDER_NUMBER">
                      Sender Number / Mobile Number
                    </option>
                    <option value="TRANSACTION_ID">Transaction ID</option>
                  </select>
                  <p className="mt-1 text-[10px] text-text-muted">
                    এই field-এর data admin panel-এ কোথায় দেখাবে
                  </p>
                </div>

                <div>
                  <Label>Placeholder</Label>
                  <input
                    type="text"
                    value={field.placeholder}
                    onChange={(e) =>
                      updateField(i, { placeholder: e.target.value })
                    }
                    placeholder="e.g. 8N7A2BXXXX"
                    className={smallInput()}
                  />
                </div>

                <div>
                  <Label>Help Text</Label>
                  <input
                    type="text"
                    value={field.helpText}
                    onChange={(e) =>
                      updateField(i, { helpText: e.target.value })
                    }
                    placeholder="customer-কে দেখানো হবে"
                    className={smallInput()}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(i, { required: e.target.checked })
                      }
                      className="w-3.5 h-3.5 text-primary rounded"
                    />
                    <span className="text-text-primary">
                      Required (customer-কে অবশ্যই পূরণ করতে হবে)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Amount Limits */}
      <Section title="Amount Limits (ঐচ্ছিক)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minimum Amount (৳)">
            <input
              name="minAmount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={d?.minAmount ?? ""}
              placeholder="0"
              className={input()}
            />
          </Field>
          <Field label="Maximum Amount (৳)">
            <input
              name="maxAmount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={d?.maxAmount ?? ""}
              placeholder="Unlimited"
              className={input()}
            />
          </Field>
        </div>
      </Section>

      {/* Display */}
      <Section title="Display">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Sort Order">
            <input
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={d?.sortOrder ?? 0}
              className={input()}
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={d?.status || "ACTIVE"}
              className={input()}
            >
              <option value="ACTIVE">Active (Checkout-এ দেখাবে)</option>
              <option value="INACTIVE">Inactive (লুকানো)</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Submit */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-bg-card border border-border rounded-xl p-4 z-10">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Payment Method"
              : "Update Payment Method"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-border hover:bg-bg-secondary transition text-text-primary font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function input() {
  return "w-full px-4 py-2.5 rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition";
}

function smallInput() {
  return "w-full px-3 py-2 rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary transition text-sm";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-bold text-text-primary mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-text-muted mb-1">
      {children}
    </label>
  );
}