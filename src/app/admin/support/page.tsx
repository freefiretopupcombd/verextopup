import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle2, XCircle, Mail } from "lucide-react";

import { listTicketsAdmin, getSupportStats, listContactsAdmin } from "@/modules/support/queries";
import { TicketTable } from "@/modules/support/admin/components/ticket-table";
import { ContactTable } from "@/modules/support/admin/components/contact-table";

export const metadata: Metadata = {
  title: "Support — Admin",
};

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const tab = params.tab || "tickets";
  const status = params.status || "all";
  const page = Math.max(1, parseInt(params.page || "1"));

  const [stats, ticketsData, contactsData] = await Promise.all([
    getSupportStats(),
    tab === "tickets"
      ? listTicketsAdmin({ status, page, perPage: 20 })
      : Promise.resolve(null),
    tab === "contacts"
      ? listContactsAdmin({ status, page, perPage: 20 })
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Support</h1>
        <p className="text-text-muted text-sm mt-1">
          Customer support tickets এবং contact messages
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          icon={MessageSquare}
          label="Total Tickets"
          value={stats.total.toString()}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Open"
          value={stats.open.toString()}
          color="warning"
        />
        <StatCard
          icon={CheckCircle2}
          label="Answered"
          value={stats.answered.toString()}
          color="success"
        />
        <StatCard
          icon={XCircle}
          label="Closed"
          value={stats.closed.toString()}
          color="text-muted"
        />
        <StatCard
          icon={Mail}
          label="New Contacts"
          value={stats.contactsNew.toString()}
          color="accent"
        />
      </div>

      {/* Tabs */}
      <div className="bg-bg-card border border-border rounded-xl p-1.5 inline-flex">
        <Link
          href="/admin/support"
          className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === "tickets"
              ? "bg-gradient-primary text-white"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Support Tickets
        </Link>
        <Link
          href="/admin/support?tab=contacts"
          className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === "contacts"
              ? "bg-gradient-primary text-white"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Contact Messages
        </Link>
      </div>

      {tab === "tickets" && ticketsData && (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["all", "OPEN", "PENDING", "ANSWERED", "CLOSED"].map((s) => {
              const active = status === s;
              return (
                <Link
                  key={s}
                  href={s === "all" ? "/admin/support" : `/admin/support?status=${s}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "bg-bg-card border border-border text-text-muted hover:border-border-light"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </Link>
              );
            })}
          </div>

          <div className="text-xs text-text-muted">
            {ticketsData.total} টা ticket
          </div>

          <TicketTable tickets={ticketsData.tickets} />
        </>
      )}

      {tab === "contacts" && contactsData && (
        <>
          <div className="text-xs text-text-muted">
            {contactsData.total} টা message
          </div>
          <ContactTable contacts={contactsData.contacts} />
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    accent: "bg-accent/10 text-accent",
    "text-muted": "bg-text-muted/10 text-text-muted",
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div
        className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className="text-lg sm:text-xl font-bold text-text-primary mt-0.5">
        {value}
      </div>
    </div>
  );
}