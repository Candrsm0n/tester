import { NextRequest, NextResponse } from "next/server";
import { sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const email = sanitizeString(String(body.email || "")).toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Masukkan alamat email terdaftar yang valid." },
      { status: 400 }
    );
  }
  return NextResponse.json({
    success: true,
    message:
      "Jika alamat email terdaftar di sistem kami, tautan pemulihan password telah dikirimkan (berlaku 30 menit).",
  });
}
