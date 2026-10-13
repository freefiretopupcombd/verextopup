import type { ReactNode } from "react";

import { auth } from "@/lib/auth/auth";
import { getUnreadCount } from "@/modules/notifications/queries";
import { getSeoSettings } from "@/modules/seo/queries";
import { Header } from "@/modules/shop/components/header";
import { Footer } from "@/modules/shop/components/footer";

// ✅ নতুন imports
import { FloatingSupportWidget } from "@/modules/support/components/floating-support-widget";
import { getSupportWidgetConfig } from "@/modules/support/settings";

export default async function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [session, seoSettings, supportConfig] = await Promise.all([
    auth(),
    getSeoSettings(),
    getSupportWidgetConfig(),
  ]);

  const user = session?.user
    ? {
        id: (session.user as any).id as string,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role as string,
      }
    : null;

  const unreadCount = user ? await getUnreadCount(user.id) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header
        user={user}
        unreadCount={unreadCount}
        seoSettings={{
          brandNamePart1: seoSettings.brandNamePart1,
          brandNamePart2: seoSettings.brandNamePart2,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* ✅ Floating Support Widget */}
      <FloatingSupportWidget
        config={supportConfig}
        isLoggedIn={!!user}
      />
    </div>
  );
}