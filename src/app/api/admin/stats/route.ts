import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { OrderRepository } from "@/repositories";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json(
      { error: "Forbidden: Akses khusus Administrator TOPUPKU." },
      { status: 403 }
    );
  }

  const stats = OrderRepository.getAdminDashboardStats();
  return NextResponse.json({ stats });
}
