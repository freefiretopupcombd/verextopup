import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { listNotificationTemplates } from "@/modules/notifications/queries";
import { TemplateCard } from "@/modules/notifications/admin/components/template-card";

export const metadata: Metadata = {
  title: "Notification Templates — Admin",
};

export default async function TemplatesPage() {
  const templates = await listNotificationTemplates();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/notifications"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Notifications-এ ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          Notification Templates
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Email এবং in-app notification template edit করুন
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 text-text-dim mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            কোনো template নেই। Database-এ seed করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}