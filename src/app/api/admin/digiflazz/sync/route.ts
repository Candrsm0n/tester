import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { syncDigiflazzPricelist } from "@/lib/digiflazz";
import { runtimeStore } from "@/lib/db/runtime-store";

export async function POST(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const marginPercent = Number(body.marginPercent || 8);

  const result = await syncDigiflazzPricelist(marginPercent);
  runtimeStore.addAuditLog({
    actorEmail: session.user.email,
    actorRole: session.user.role,
    action: "SYNC_DIGIFLAZZ_PRICELIST",
    module: "SUPPLIER",
    details: { marginPercent, ...result },
  });

  return NextResponse.json({
    success: true,
    message: `Sinkronisasi Digiflazz selesai! ${result.syncedSkus} SKU diperbarui dengan margin ${marginPercent}%.`,
    result,
  });
}
