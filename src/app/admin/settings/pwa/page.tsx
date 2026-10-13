import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Smartphone } from "lucide-react";

import { getPWAConfig } from "@/modules/pwa/settings";
import { PWAConfigForm } from "@/modules/pwa/admin/components/pwa-config-form";

export const metadata: Metadata = {
  title: "PWA Settings — Admin",
};

export default async function PWASettingsPage() {
  const config = await getPWAConfig();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings-এ ফিরুন
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              PWA & Install App Settings
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              Customer দের app install banner এবং app info control করুন
            </p>
          </div>
        </div>
      </div>

      <PWAConfigForm initial={config} />
    </div>
  );
}