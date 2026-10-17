import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { runtimeStore } from "@/lib/db/runtime-store";
import { checkRateLimit, hashPassword } from "@/lib/security";
import { buildHttpOnlyCookieHeader, signSessionToken } from "@/lib/auth/session";
import { dispatchMultiChannelNotification } from "@/lib/notifications";
import { validateRegisterInput } from "@/validations";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = checkRateLimit(`register:${ip}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Batas pendaftaran tercapai. Silakan coba beberapa saat lagi." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const validation = validateRegisterInput(body);
  if (!validation.success || !validation.data) {
    return NextResponse.json(
      {
        error: validation.errors?.[0]?.message || "Data pendaftaran belum valid.",
        errors: validation.errors,
      },
      { status: 400 }
    );
  }

  const { fullName, username, email, phone, password, referralCode } =
    validation.data;

  const existing = Array.from(runtimeStore.users.values()).find(
    (u) => u.email === email || u.username === username
  );
  if (existing) {
    return NextResponse.json(
      { error: "Email atau Username sudah terdaftar. Gunakan akun lain." },
      { status: 409 }
    );
  }

  // Bonus referral if valid referral code was used
  let initialBalance = 0;
  let initialPoints = 100;
  if (referralCode) {
    const referrer = Array.from(runtimeStore.users.values()).find(
      (u) => u.referralCode === referralCode
    );
    if (referrer) {
      referrer.walletBalance += 5000;
      referrer.loyaltyPoints += 250;
      initialBalance = 2500;
      initialPoints = 250;
    }
  }

  const userId = `usr_${crypto.randomUUID().slice(0, 10)}`;
  const myReferralCode = `${username.slice(0, 5).toUpperCase()}${Math.floor(
    100 + Math.random() * 900
  )}`;

  const newUser = {
    id: userId,
    email,
    username,
    fullName,
    phone,
    passwordHash: hashPassword(password),
    role: "USER" as const,
    memberLevel: "BRONZE" as const,
    status: "ACTIVE" as const,
    walletBalance: initialBalance,
    loyaltyPoints: initialPoints,
    referralCode: myReferralCode,
    referredByCode: referralCode || null,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  runtimeStore.users.set(userId, newUser);

  await dispatchMultiChannelNotification({
    userId,
    email,
    whatsapp: phone,
    eventType: "ACCOUNT_CREATED",
    title: "Selamat Datang di TOPUPKU!",
    message: `Akun member ${fullName} (@${username}) telah aktif. Kode referral Anda: ${myReferralCode}.`,
  });

  const sessionUser = {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    fullName: newUser.fullName,
    phone: newUser.phone,
    role: newUser.role,
    memberLevel: newUser.memberLevel,
    walletBalance: newUser.walletBalance,
    loyaltyPoints: newUser.loyaltyPoints,
    referralCode: newUser.referralCode,
  };

  const token = signSessionToken(sessionUser);
  const res = NextResponse.json(
    {
      success: true,
      user: sessionUser,
      message: "Pendaftaran akun berhasil!",
    },
    { status: 201 }
  );
  res.headers.set("Set-Cookie", buildHttpOnlyCookieHeader(token));
  return res;
}
