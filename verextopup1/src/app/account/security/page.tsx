import type { Metadata } from "next";

import { ChangePasswordForm } from "@/modules/users/admin/components/change-password-form";

export const metadata: Metadata = {
  title: "Security — VerexTopUp",
};

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-content">
          নিরাপত্তা
        </h1>
        <p className="text-content-muted mt-1">
          আপনার account-এর নিরাপত্তা ব্যবস্থাপনা
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-content mb-4">
          Password পরিবর্তন
        </h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}