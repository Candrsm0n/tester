import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { ENV_CONFIG, getAppMode, maskSecret } from "@/config/env";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Strictly mask all API secrets — never expose raw secret keys to browser!
  return NextResponse.json({
    appMode: getAppMode(),
    midtrans: {
      isProduction: ENV_CONFIG.midtrans.isProduction,
      merchantId: ENV_CONFIG.midtrans.merchantId,
      clientKeyMasked: maskSecret(ENV_CONFIG.midtrans.clientKey),
      serverKeyMasked: maskSecret(ENV_CONFIG.midtrans.serverKey),
      coreApiUrl: ENV_CONFIG.midtrans.coreApiUrl,
      qrisExpiryMinutes: ENV_CONFIG.midtrans.qrisExpiryMinutes,
      webhookEndpoint: `${ENV_CONFIG.appUrl}/api/webhooks/midtrans`,
    },
    digiflazz: {
      username: ENV_CONFIG.digiflazz.username || "demo_digiflazz_user",
      apiKeyMasked: maskSecret(ENV_CONFIG.digiflazz.apiKey),
      webhookSecretMasked: maskSecret(ENV_CONFIG.digiflazz.webhookSecret),
      apiUrl: ENV_CONFIG.digiflazz.apiUrl,
      defaultMarginPercent: ENV_CONFIG.digiflazz.defaultMarginPercent,
      webhookEndpoint: `${ENV_CONFIG.appUrl}/api/webhooks/digiflazz`,
    },
    whatsapp: {
      enabled: ENV_CONFIG.whatsapp.enabled,
      provider: ENV_CONFIG.whatsapp.provider,
      apiUrl: ENV_CONFIG.whatsapp.apiUrl,
      apiTokenMasked: maskSecret(ENV_CONFIG.whatsapp.apiToken),
      csNumber: ENV_CONFIG.whatsapp.csNumber,
    },
    smtp: {
      enabled: ENV_CONFIG.smtp.enabled,
      host: ENV_CONFIG.smtp.host,
      port: ENV_CONFIG.smtp.port,
      user: ENV_CONFIG.smtp.user || "noreply@topupku.id",
      passMasked: maskSecret(ENV_CONFIG.smtp.pass),
      from: ENV_CONFIG.smtp.from,
    },
  });
}
