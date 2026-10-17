import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";
import { sanitizeString } from "@/lib/security";

export async function PATCH(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const user = runtimeStore.users.get(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  if (body.fullName) {
    user.fullName = sanitizeString(String(body.fullName));
  }
  if (body.phone) {
    user.phone = sanitizeString(String(body.phone)).replace(/[^0-9+]/g, "");
  }
  if (typeof body.twoFactorEnabled === "boolean") {
    user.twoFactorEnabled = body.twoFactorEnabled;
  }

  runtimeStore.users.set(user.id, user);
  return NextResponse.json({
    success: true,
    message: "Profil berhasil diperbarui.",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      memberLevel: user.memberLevel,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
      referralCode: user.referralCode,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  });
}
