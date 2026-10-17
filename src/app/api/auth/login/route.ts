import { NextRequest, NextResponse } from "next/server";
import { runtimeStore } from "@/lib/db/runtime-store";
import { checkRateLimit, verifyPassword } from "@/lib/security";
import { buildHttpOnlyCookieHeader, signSessionToken } from "@/lib/auth/session";
import { validateLoginInput } from "@/validations";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = checkRateLimit(`login:${ip}`, 15, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Silakan tunggu 1 menit." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const validation = validateLoginInput(body);
  if (!validation.success || !validation.data) {
    return NextResponse.json(
      { error: validation.errors?.[0]?.message || "Input tidak valid" },
      { status: 400 }
    );
  }

  const { identifier, password } = validation.data;
  const matchedUser = Array.from(runtimeStore.users.values()).find(
    (u) => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
  );

  if (!matchedUser || !verifyPassword(password, matchedUser.passwordHash)) {
    return NextResponse.json(
      { error: "Email/Username atau password yang Anda masukkan salah." },
      { status: 401 }
    );
  }

  if (matchedUser.status !== "ACTIVE") {
    return NextResponse.json(
      { error: `Akun Anda berstatus ${matchedUser.status}. Hubungi CS TOPUPKU.` },
      { status: 403 }
    );
  }

  matchedUser.lastLoginAt = new Date().toISOString();
  const sessionUser = {
    id: matchedUser.id,
    email: matchedUser.email,
    username: matchedUser.username,
    fullName: matchedUser.fullName,
    phone: matchedUser.phone,
    role: matchedUser.role,
    memberLevel: matchedUser.memberLevel,
    walletBalance: matchedUser.walletBalance,
    loyaltyPoints: matchedUser.loyaltyPoints,
    referralCode: matchedUser.referralCode,
  };

  const token = signSessionToken(sessionUser);
  const res = NextResponse.json({
    success: true,
    user: sessionUser,
    message: "Login berhasil! Selamat datang kembali di TOPUPKU.",
  });
  res.headers.set("Set-Cookie", buildHttpOnlyCookieHeader(token));
  return res;
}
