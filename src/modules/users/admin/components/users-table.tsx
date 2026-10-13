"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Eye,
  Shield,
  Ban,
  Send,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { ChangeRoleModal } from "./change-role-modal";
import { ChangeStatusModal } from "./change-status-modal";
import { SendNotificationModal } from "./send-notification-modal";

type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  wallet: {
    id: string;
    balance: number;
    currency: string;
    status: string;
  } | null;
  orderCount: number;
  reviewCount: number;
  ticketCount: number;
};

export function UsersTable({
  users,
  isSuperAdmin,
}: {
  users: User[];
  isSuperAdmin: boolean;
}) {
  const [openMenu, setOpenMenu] = useState<{
    id: string;
    rect: DOMRect;
  } | null>(null);
  const [roleModal, setRoleModal] = useState<User | null>(null);
  const [statusModal, setStatusModal] = useState<User | null>(null);
  const [notifModal, setNotifModal] = useState<User | null>(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  if (users.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-text-muted">কোনো user পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  User
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold hidden md:table-cell">
                  Role
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                  Wallet
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold hidden lg:table-cell text-center">
                  Orders
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const menuOpen = openMenu?.id === u.id;
                const isBanned = u.status === "BANNED";
                const isFrozen = u.wallet?.status === "FROZEN";

                return (
                  <tr key={u.id} className="hover:bg-bg-secondary/40 transition">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary truncate group-hover:text-primary transition">
                            {u.name || "—"}
                          </div>
                          <div className="text-[11px] text-text-muted truncate">
                            {u.email}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.role === "SUPER_ADMIN" ? (
                        <span className="text-[10px] font-bold uppercase bg-primary/15 text-primary px-2 py-0.5 rounded">
                          SUPER
                        </span>
                      ) : u.role === "ADMIN" ? (
                        <span className="text-[10px] font-bold uppercase bg-accent/15 text-accent px-2 py-0.5 rounded">
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase text-text-muted">
                          Customer
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-text-primary">
                        ৳{u.wallet ? u.wallet.balance.toFixed(2) : "0.00"}
                      </div>
                      {isFrozen && (
                        <div className="text-[9px] text-danger font-bold uppercase mt-0.5">
                          Frozen
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-xs text-text-muted">
                        {u.orderCount}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isBanned ? (
                        <span className="text-[10px] font-bold uppercase bg-danger/15 text-danger px-2 py-0.5 rounded">
                          Banned
                        </span>
                      ) : u.status === "ACTIVE" ? (
                        <span className="text-[10px] font-bold uppercase bg-success/15 text-success px-2 py-0.5 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-text-muted/15 text-text-muted px-2 py-0.5 rounded">
                          {u.status}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (menuOpen) {
                            closeMenu();
                          } else {
                            const rect = (
                              e.currentTarget as HTMLElement
                            ).getBoundingClientRect();
                            setOpenMenu({ id: u.id, rect });
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted inline-flex"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {openMenu && (
        <UserActionsDropdown
          user={users.find((u) => u.id === openMenu.id)!}
          anchorRect={openMenu.rect}
          isSuperAdmin={isSuperAdmin}
          onClose={closeMenu}
          onOpenRole={(u) => {
            setRoleModal(u);
            closeMenu();
          }}
          onOpenStatus={(u) => {
            setStatusModal(u);
            closeMenu();
          }}
          onOpenNotif={(u) => {
            setNotifModal(u);
            closeMenu();
          }}
        />
      )}

      {roleModal && (
        <ChangeRoleModal user={roleModal} onClose={() => setRoleModal(null)} />
      )}
      {statusModal && (
        <ChangeStatusModal
          user={statusModal}
          onClose={() => setStatusModal(null)}
        />
      )}
      {notifModal && (
        <SendNotificationModal
          user={notifModal}
          onClose={() => setNotifModal(null)}
        />
      )}
    </>
  );
}

// ==================================================
// PORTAL-BASED DROPDOWN
// ==================================================
function UserActionsDropdown({
  user,
  anchorRect,
  isSuperAdmin,
  onClose,
  onOpenRole,
  onOpenStatus,
  onOpenNotif,
}: {
  user: User;
  anchorRect: DOMRect;
  isSuperAdmin: boolean;
  onClose: () => void;
  onOpenRole: (u: User) => void;
  onOpenStatus: (u: User) => void;
  onOpenNotif: (u: User) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const isBanned = user.status === "BANNED";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Position calculation — flip up if near bottom, pin to viewport edges
  useEffect(() => {
    if (!mounted) return;

    const menuWidth = 220;
    const menuHeight = menuRef.current?.offsetHeight || 240;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const gap = 6;
    const padding = 12;

    // Default: below the button, right-aligned with button
    let top = anchorRect.bottom + gap;
    let left = anchorRect.right - menuWidth;

    // If menu goes below viewport → flip up
    if (top + menuHeight > viewportH - padding) {
      const spaceAbove = anchorRect.top - gap;
      if (spaceAbove >= menuHeight) {
        top = anchorRect.top - menuHeight - gap;
      } else {
        // Pin to bottom edge of viewport
        top = Math.max(padding, viewportH - menuHeight - padding);
      }
    }

    // If menu goes right beyond viewport → shift left
    if (left + menuWidth > viewportW - padding) {
      left = viewportW - menuWidth - padding;
    }

    // If menu goes left beyond viewport → pin to left
    if (left < padding) {
      left = padding;
    }

    // If top is above viewport → pin to top
    if (top < padding) {
      top = padding;
    }

    setPosition({ top, left });
  }, [anchorRect, mounted]);

  // Close on escape / outside click / scroll / resize
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleScroll = () => onClose();
    const handleResize = () => onClose();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: 220,
      }}
      className="z-[9999] bg-bg-card border border-border rounded-lg shadow-2xl py-1"
    >
      <Link
        href={`/admin/users/${user.id}`}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary"
        onClick={onClose}
      >
        <Eye className="w-3.5 h-3.5" />
        View Profile
      </Link>

      <Link
        href={`/admin/users/${user.id}?tab=wallet`}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary"
        onClick={onClose}
      >
        <Wallet className="w-3.5 h-3.5" />
        Wallet Details
      </Link>

      <button
        type="button"
        onClick={() => onOpenNotif(user)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary text-left"
      >
        <Send className="w-3.5 h-3.5" />
        Send Notification
      </button>

      {isSuperAdmin && user.role !== "SUPER_ADMIN" && (
        <>
          <div className="h-px bg-border my-1" />

          <button
            type="button"
            onClick={() => onOpenRole(user)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 text-left"
          >
            <Shield className="w-3.5 h-3.5" />
            Change Role
          </button>

          <button
            type="button"
            onClick={() => onOpenStatus(user)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${
              isBanned
                ? "text-success hover:bg-success/10"
                : "text-danger hover:bg-danger/10"
            }`}
          >
            {isBanned ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unban User
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                Ban / Suspend
              </>
            )}
          </button>
        </>
      )}
    </div>,
    document.body
  );
}