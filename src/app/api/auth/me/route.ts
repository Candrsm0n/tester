import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const verified = verifySessionToken(token);
  if (!verified) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const freshUser = runtimeStore.users.get(verified.user.id);
  const user = freshUser
    ? {
        id: freshUser.id,
        email: freshUser.email,
        username: freshUser.username,
        fullName: freshUser.fullName,
        phone: freshUser.phone,
        role: freshUser.role,
        memberLevel: freshUser.memberLevel,
        walletBalance: freshUser.walletBalance,
        loyaltyPoints: freshUser.loyaltyPoints,
        referralCode: freshUser.referralCode,
      }
    : verified.user;

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
