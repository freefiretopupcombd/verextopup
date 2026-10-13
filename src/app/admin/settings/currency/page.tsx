import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, DollarSign } from "lucide-react";

import { getCurrencySettings } from "@/modules/settings/actions";
import { CurrencyForm } from "@/modules/settings/components/currency-form";

export const metadata: Metadata = {
  title: "Currency Settings — Admin",
};

export default async function CurrencySettingsPage() {
  const { usdToBdt, defaultCurrency } = await getCurrencySettings();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-content-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-content">
          Currency Settings
        </h1>
        <p className="text-content-muted text-sm mt-1">
          Exchange rate এবং multi-currency ব্যবস্থাপনা
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-content">
                Exchange Rate Configuration
              </h2>
              <p className="text-xs text-content-muted">
                Product-এর price BDT-তে save হয়। Frontend-এ convert হয়ে দেখায়।
              </p>
            </div>
          </div>

          <CurrencyForm
            initialUsdToBdt={usdToBdt}
            initialDefaultCurrency={defaultCurrency}
          />
        </div>
      </div>
    </div>
  );
}