import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { extractCookieValue, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";
import { buildDynamicQrisString } from "@/lib/midtrans";
import { getAppMode, isProductionMode } from "@/config/env";
import { validateDepositInput } from "@/validations";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = Array.from(runtimeStore.deposits.values()).filter(
    (d) => d.userId === session.user.id
  );
  return NextResponse.json({ deposits: list });
}

export async function POST(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;

  // Support settling a DEMO deposit
  if (body.action === "SIMULATE_SETTLE" && body.depositCode) {
    if (isProductionMode()) {
      return NextResponse.json(
        { error: "Simulasi deposit tidak diizinkan pada mode PRODUCTION." },
        { status: 403 }
      );
    }
    const dep = runtimeStore.deposits.get(String(body.depositCode));
    if (!dep || dep.userId !== session.user.id) {
      return NextResponse.json({ error: "Deposit tidak ditemukan." }, { status: 404 });
    }
    if (dep.status !== "SETTLEMENT") {
      dep.status = "SETTLEMENT";
      dep.paidAt = new Date().toISOString();
      const usr = runtimeStore.users.get(session.user.id);
      if (usr) {
        usr.walletBalance += dep.amount;
      }
    }
    return NextResponse.json({
      success: true,
      deposit: dep,
      message: "Deposit saldo berhasil diverifikasi dan ditambahkan ke Saldo Akun!",
    });
  }

  const validation = validateDepositInput(body);
  if (!validation.success || !validation.data) {
    return NextResponse.json(
      { error: validation.errors?.[0]?.message || "Nominal deposit tidak valid." },
      { status: 400 }
    );
  }

  const uniqueCode = Math.floor(Math.random() * 89) + 10;
  const totalPayable = validation.data.amount + uniqueCode;
  const depositCode = `DEP-${Date.now().toString().slice(-6)}-${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
  const mode = getAppMode();

  const deposit = {
    id: `dep_${crypto.randomUUID().slice(0, 8)}`,
    depositCode,
    userId: session.user.id,
    amount: validation.data.amount,
    uniqueCode,
    totalPayable,
    qrisString: buildDynamicQrisString(depositCode, totalPayable, mode === "DEMO"),
    status: "PENDING" as const,
    executionMode: mode,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    paidAt: null,
  };

  runtimeStore.deposits.set(depositCode, deposit);
  return NextResponse.json({ success: true, deposit }, { status: 201 });
}
