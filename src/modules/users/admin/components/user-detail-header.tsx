"use client";

import { useState } from "react";
import {
  Shield,
  Ban,
  Send,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  Snowflake,
} from "lucide-react";
import { ChangeRoleModal } from "./change-role-modal";
import { ChangeStatusModal } from "./change-status-modal";
import { SendNotificationModal } from "./send-notification-modal";

type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  wallet: {
    id: string;
    balance: number;
    currency: string;
    status: string;
  } | null;
};

export function UserDetailHeader({
  user,
  isSuperAdmin,
  isSelf,
}: {
  user: User;
  isSuperAdmin: boolean;
  isSelf: boolean;
}) {
  const [roleModal, setRoleModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);

  const isBanned = user.status === "BANNED";
  const isFrozen = user.wallet?.status === "FROZEN";
  const canModify = isSuperAdmin && !isSelf && user.role !== "SUPER_ADMIN";

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-text-primary">
                {user.name || "Unnamed User"}
              </h1>

              {user.role === "SUPER_ADMIN" && (
                <span className="text-[10px] font-bold uppercase bg-primary/15 text-primary px-2 py-0.5 rounded">
                  Super Admin
                </span>
              )}
              {user.role === "ADMIN" && (
                <span className="text-[10px] font-bold uppercase bg-accent/15 text-accent px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
              {user.role === "CUSTOMER" && (
                <span className="text-[10px] uppercase text-text-muted border border-border px-2 py-0.5 rounded">
                  Customer
                </span>
              )}

              {isBanned && (
                <span className="text-[10px] font-bold uppercase bg-danger/15 text-danger px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <Ban className="w-2.5 h-2.5" />
                  Banned
                </span>
              )}
              {isFrozen && (
                <span className="text-[10px] font-bold uppercase bg-warning/15 text-warning px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <Snowflake className="w-2.5 h-2.5" />
                  Wallet Frozen
                </span>
              )}
              {isSelf && (
                <span className="text-[10px] font-bold uppercase bg-info/15 text-info px-2 py-0.5 rounded">
                  You
                </span>
              )}
            </div>

            {/* Contact info */}
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <span className="truncate">{user.email}</span>
                {user.emailVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                )}
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-text-muted text-xs">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setNotifModal(true)}
              className="px-3 py-2 rounded-lg bg-bg-secondary text-text-secondary hover:text-primary hover:bg-primary/10 transition text-sm font-medium inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Notify</span>
            </button>

            {canModify && (
              <>
                <button
                  type="button"
                  onClick={() => setRoleModal(true)}
                  className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium inline-flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusModal(true)}
                  className={`px-3 py-2 rounded-lg transition text-sm font-medium inline-flex items-center gap-2 ${
                    isBanned
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-danger/10 text-danger hover:bg-danger/20"
                  }`}
                >
                  {isBanned ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Unban</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      <span className="hidden sm:inline">Ban</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {roleModal && (
        <ChangeRoleModal
          user={{
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }}
          onClose={() => setRoleModal(false)}
        />
      )}
      {statusModal && (
        <ChangeStatusModal
          user={{
            id: user.id,
            email: user.email,
            name: user.name,
            status: user.status,
          }}
          onClose={() => setStatusModal(false)}
        />
      )}
      {notifModal && (
        <SendNotificationModal
          user={{ id: user.id, email: user.email, name: user.name }}
          onClose={() => setNotifModal(false)}
        />
      )}
    </>
  );
}