import type { Metadata } from "next";
import Link from "next/link";
import { Ticket, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { SupportHero } from "@/modules/support/components/support-hero";
import { ContactCards } from "@/modules/support/components/contact-cards";
import { FaqCategories } from "@/modules/support/components/faq-categories";
import { PopularFaqs } from "@/modules/support/components/popular-faqs";
import { ContactFormGlobal } from "@/modules/support/components/contact-form-global";
import { SupportStats } from "@/modules/support/components/support-stats";

export const metadata: Metadata = {
  title: "Support & Help Center",
  description:
    "আমাদের সাপোর্ট টিম আপনার সমস্যার সমাধান করতে প্রস্তুত। Payment, wallet, order, account — সব বিষয়ে সাহায্য নিন।",
};

export default async function SupportPage() {
  const [session, ticketCount, openTickets] = await Promise.all([
    getSession(),
    prisma.supportTicket.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
  ]);

  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <SupportHero />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-12">
        {/* Stats */}
        <SupportStats
          totalTickets={ticketCount}
          openTickets={openTickets}
          avgResponseHours={6}
        />

        {/* Contact Cards */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              যোগাযোগ করুন
            </h2>
            <p className="text-text-muted text-sm mt-1">
              আপনার পছন্দের মাধ্যম বেছে নিন
            </p>
          </div>
          <ContactCards
  supportEmail="support@verextopup.com"
  whatsappNumber="+8801317956376"
  isLoggedIn={isLoggedIn}
/>
        </section>

        {/* Login prompt for tickets (if not logged in) */}
        {!isLoggedIn && (
          <div className="bg-gradient-to-r from-primary/10 via-bg-card to-accent/10 border border-primary/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-text-primary">
                Log in করে ticket তৈরি করুন
              </h3>
              <p className="text-sm text-text-muted mt-0.5">
                Account থাকলে দ্রুত সমস্যা track করতে পারবেন
              </p>
            </div>
            <Link
              href="/login?callbackUrl=/account/support/new"
              className="inline-flex items-center gap-2 bg-gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shrink-0"
            >
              Log In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* FAQ Categories */}
        <section>
          <FaqCategories isLoggedIn={isLoggedIn} />

        </section>

        {/* Popular FAQs */}
        <section>
          <PopularFaqs />
        </section>

        {/* Contact Form */}
        <section className="max-w-2xl mx-auto">
          <ContactFormGlobal />
        </section>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            এখনো সাহায্য পাচ্ছেন না?
          </h2>
          <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
            আমাদের Live Chat এ যোগাযোগ করুন — ২৪/৭ উপলব্ধ
          </p>
          <Link
  href={
    isLoggedIn
      ? "/account/support/new"
      : `/login?callbackUrl=${encodeURIComponent("/account/support/new")}`
  }
  className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition mt-5"
>
  {isLoggedIn ? "Contact Support" : "Login to Contact"}{" "}
  <ArrowRight className="w-4 h-4" />
</Link>
        </section>
      </div>
    </div>
  );
}