import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { exportTransactions } from "@/modules/wallet/admin/queries";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const data = await exportTransactions({
    search: searchParams.get("search") || undefined,
    type: searchParams.get("type") || undefined,
    reason: searchParams.get("reason") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  });

  // Build CSV
  const headers = [
    "ID",
    "Date",
    "User Name",
    "User Email",
    "Type",
    "Amount (BDT)",
    "Balance Before",
    "Balance After",
    "Reason",
    "Reference",
    "Note",
    "Admin ID",
    "Status",
  ];

  const csvEscape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = data.map((t) =>
    [
      t.id,
      t.createdAt,
      t.userName,
      t.userEmail,
      t.type,
      t.amount.toFixed(2),
      t.balanceBefore.toFixed(2),
      t.balanceAfter.toFixed(2),
      t.reason,
      t.reference,
      t.note,
      t.adminId,
      t.status,
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}