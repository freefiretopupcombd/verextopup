"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

type Ticket = {
  id: string;
  ticketNo: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  lastReplyAt: string;
  messageCount: number;
  user: { id: string; name: string | null; email: string };
};

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-primary/15 text-primary",
  PENDING: "bg-warning/15 text-warning",
  ANSWERED: "bg-success/15 text-success",
  CLOSED: "bg-text-muted/15 text-text-muted",
};

const PRIORITY_STYLE: Record<string, string> = {
  LOW: "bg-text-muted/15 text-text-muted",
  NORMAL: "bg-primary/15 text-primary",
  HIGH: "bg-warning/15 text-warning",
  URGENT: "bg-danger/15 text-danger",
};

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">কোনো ticket নেই</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">
                Ticket
              </th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">
                Customer
              </th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary hidden md:table-cell">
                Category
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary">
                Status
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary hidden lg:table-cell">
                Priority
              </th>
              <th className="text-right px-4 py-3 font-semibold text-text-primary">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.id}
                className="border-b border-border last:border-0 hover:bg-bg-secondary/50"
              >
                <td className="px-4 py-3">
                  <div className="font-mono text-xs text-primary font-bold">
                    {t.ticketNo}
                  </div>
                  <div className="text-xs text-text-primary truncate max-w-[250px] mt-0.5">
                    {t.subject}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {new Date(t.lastReplyAt).toLocaleString("en-GB")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-text-primary truncate max-w-[150px]">
                    {t.user.name || "Unknown"}
                  </div>
                  <div className="text-[10px] text-text-muted truncate max-w-[150px]">
                    {t.user.email}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">
                  {t.category}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/support/${t.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}