import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ auditLogs: runtimeStore.auditLogs });
}
