import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getLiveUsers } from "@/modules/analytics/admin/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getLiveUsers();
  return NextResponse.json(data);
}