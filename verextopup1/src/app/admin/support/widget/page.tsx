import type { Metadata } from "next";
import { MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

import { getSupportWidgetConfig } from "@/modules/support/settings";
import { SupportChannelsConfig } from "@/modules/support/components/support-channels-config";

export const metadata: Metadata = {
  title: "Support Widget — Admin",
};

export default async function SupportWidgetAdminPage() {
  const config = await getSupportWidgetConfig();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Floating Support Widget
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              Website এ floating button — WhatsApp, Messenger, Telegram, Phone, Email
            </p>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary text-text-secondary hover:bg-primary/10 hover:text-primary transition text-sm font-medium"
        >
          View Site <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Info banner */}
      <div className="bg-info/5 border border-info/20 rounded-xl p-3 text-xs text-text-primary">
        💡 <strong>Tip:</strong> Save করার পর website reload করলে সাথে সাথে
        floating button দেখতে পাবেন।
      </div>

      {/* Config form */}
      <SupportChannelsConfig initial={config} />
    </div>
  );
}