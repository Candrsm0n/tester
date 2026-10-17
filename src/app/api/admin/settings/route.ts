import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";
import { sanitizeString } from "@/lib/security";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    settings: runtimeStore.websiteSettings,
    banners: runtimeStore.banners,
    vouchers: runtimeStore.vouchers,
  });
}

export async function PATCH(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === "string") {
      runtimeStore.websiteSettings[k] = sanitizeString(v);
    }
  }

  runtimeStore.addAuditLog({
    actorEmail: session.user.email,
    actorRole: session.user.role,
    action: "UPDATE_WEBSITE_SETTINGS",
    module: "SETTINGS",
    details: body,
  });

  return NextResponse.json({
    success: true,
    settings: runtimeStore.websiteSettings,
  });
}
