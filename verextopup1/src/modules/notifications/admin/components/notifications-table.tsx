"use client";

import { Bell } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export function NotificationsTable({
  notifications,
}: {
  notifications: Notification[];
}) {
  if (notifications.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">কোনো notification নেই</p>
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
                Notification
              </th>
              <th className="text-left px-4 py-3 font-semibold text-text-primary">
                User
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary">
                Type
              </th>
              <th className="text-center px-4 py-3 font-semibold text-text-primary">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr
                key={n.id}
                className="border-b border-border last:border-0 hover:bg-bg-secondary/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-text-primary text-xs">
                    {n.title}
                  </div>
                  <div className="text-[10px] text-text-muted line-clamp-2 mt-0.5">
                    {n.message}
                  </div>
                  <div className="text-[10px] text-text-dim mt-1">
                    {new Date(n.createdAt).toLocaleString("en-GB")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-text-primary truncate max-w-[150px]">
                    {n.user.name || "Unknown"}
                  </div>
                  <div className="text-[10px] text-text-muted truncate max-w-[150px]">
                    {n.user.email}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[10px] bg-bg-secondary text-text-muted px-2 py-0.5 rounded font-mono">
                    {n.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      n.isRead
                        ? "bg-success/15 text-success"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {n.isRead ? "Read" : "Unread"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}