"use client";

import { useActionState } from "react";
import { Loader2, Bell } from "lucide-react";

import {
  updatePreferencesAction,
  type ActionState,
} from "../actions";

type Preferences = {
  orderUpdates: boolean;
  paymentUpdates: boolean;
  walletUpdates: boolean;
  reviewUpdates: boolean;
  supportUpdates: boolean;
  marketingEmails: boolean;
  emailEnabled: boolean;
};

const initialState: ActionState = { success: false };

export function PreferencesForm({
  initialData,
}: {
  initialData: Preferences;
}) {
  const [state, formAction, isPending] = useActionState(
    updatePreferencesAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Notification Preferences
            </h2>
            <p className="text-sm text-text-muted">
              কোন ধরনের notification পেতে চান সেটা select করুন
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Toggle
            name="orderUpdates"
            label="Order Updates"
            description="Order placed, processed, completed — এই update গুলো"
            defaultChecked={initialData.orderUpdates}
          />
          <Toggle
            name="paymentUpdates"
            label="Payment Updates"
            description="Payment received, approved, rejected — এই update গুলো"
            defaultChecked={initialData.paymentUpdates}
          />
          <Toggle
            name="walletUpdates"
            label="Wallet Updates"
            description="Wallet credited, debited — এই update গুলো"
            defaultChecked={initialData.walletUpdates}
          />
          <Toggle
            name="reviewUpdates"
            label="Review Updates"
            description="আপনার review approve/reject হলে জানতে চান?"
            defaultChecked={initialData.reviewUpdates}
          />
          <Toggle
            name="supportUpdates"
            label="Support Updates"
            description="Ticket reply আসলে জানতে চান?"
            defaultChecked={initialData.supportUpdates}
          />
          <Toggle
            name="marketingEmails"
            label="Marketing Emails"
            description="Special offers, promo, এবং নতুন product এর খবর"
            defaultChecked={initialData.marketingEmails}
          />
          <Toggle
            name="emailEnabled"
            label="Email Notifications (All)"
            description="সব email notification বন্ধ/চালু করুন"
            defaultChecked={initialData.emailEnabled}
          />
        </div>

        {state.message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              state.success
                ? "bg-success/10 text-success border border-success/20"
                : "bg-danger/10 text-danger border border-danger/20"
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="bg-gradient-primary text-white font-semibold px-6 py-2.5 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-bg-secondary transition">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 mt-1 text-primary rounded"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{description}</div>
      </div>
    </label>
  );
}