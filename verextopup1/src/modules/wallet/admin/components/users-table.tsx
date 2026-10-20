"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MoreVertical,
  Settings2,
  Snowflake,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { AdjustBalanceModal } from "./adjust-balance-modal";
import { FreezeWalletModal } from "./freeze-modal";

type Wallet = {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: string;
  txnCount: number;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    image: string | null;
    role: string;
    status: string;
  } | null;
};

export function UsersTable({
  wallets,
  isSuperAdmin,
}: {
  wallets: Wallet[];
  isSuperAdmin: boolean;
}) {
  const [adjustTarget, setAdjustTarget] = useState<Wallet | null>(null);
  const [freezeTarget, setFreezeTarget] = useState<Wallet | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (wallets.length === 0) {
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
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                  Balance
                </th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-center hidden sm:table-cell">
                  Txns
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
              {wallets.map((w) => {
                const frozen = w.status === "FROZEN";
                const menuOpen = openMenu === w.id;

                return (
                  <tr
                    key={w.id}
                    className="hover:bg-bg-secondary/40 transition"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {(w.user?.name || w.user?.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary truncate">
                            {w.user?.name || "—"}
                          </div>
                          <div className="text-[11px] text-text-muted truncate">
                            {w.user?.email || w.userId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-text-primary">
                        ৳{w.balance.toFixed(2)}
                      </div>
                    </td>

                    {/* Txn count */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="text-xs text-text-muted">
                        {w.txnCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {frozen ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-danger/15 text-danger px-2 py-0.5 rounded">
                          <Snowflake className="w-2.5 h-2.5" />
                          Frozen
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] font-bold uppercase bg-success/15 text-success px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 relative">
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => setAdjustTarget(w)}
                            className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-xs font-medium inline-flex items-center gap-1"
                            title="Adjust Balance"
                          >
                            <Settings2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Adjust</span>
                          </button>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(menuOpen ? null : w.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {menuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg z-50 min-w-[180px] py-1">
                                <Link
                                  href={`/admin/wallets/users/${w.userId}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary"
                                  onClick={() => setOpenMenu(null)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Detail
                                </Link>

                                {isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFreezeTarget(w);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/10 text-left"
                                  >
                                    <Snowflake className="w-3.5 h-3.5" />
                                    {frozen ? "Unfreeze" : "Freeze"} Wallet
                                  </button>
                                )}

                                {!isSuperAdmin && (
                                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-text-muted">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Super Admin only
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {adjustTarget && (
        <AdjustBalanceModal
          wallet={adjustTarget}
          onClose={() => setAdjustTarget(null)}
        />
      )}
      {freezeTarget && (
        <FreezeWalletModal
          wallet={freezeTarget}
          onClose={() => setFreezeTarget(null)}
        />
      )}
    </>
  );
}