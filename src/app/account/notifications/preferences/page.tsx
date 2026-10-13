import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getUserPreferences } from "@/modules/notifications/queries";
import { PreferencesForm } from "@/modules/notifications/components/preferences-form";

export const metadata: Metadata = {
  title: "Notification Preferences — VerexTopUp",
  robots: { index: false, follow: false }, // private page
};

export default async function PreferencesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/notifications/preferences");
  }

  const userId = (session.user as any).id as string;
  const prefs = await getUserPreferences(userId);

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href="/account/notifications"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Notifications-এ ফিরুন
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Notification Preferences
        </h1>
        <p className="text-sm text-text-muted mt-1">
          কোন ধরনের notification পেতে চান সেটা select করুন
        </p>
      </div>

      <PreferencesForm initialData={prefs} />
    </div>
  );
}