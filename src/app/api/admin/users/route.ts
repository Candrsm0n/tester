import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = Array.from(runtimeStore.users.values()).map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    memberLevel: u.memberLevel,
    status: u.status,
    walletBalance: u.walletBalance,
    loyaltyPoints: u.loyaltyPoints,
    referralCode: u.referralCode,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }));

  return NextResponse.json({ users });
}
