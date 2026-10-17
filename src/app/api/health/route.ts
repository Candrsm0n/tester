import { NextResponse } from "next/server";
import { ENV_CONFIG, getAppMode } from "@/config/env";
import { runtimeStore } from "@/lib/db/runtime-store";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: ENV_CONFIG.appName,
    executionMode: getAppMode(),
    timezone: ENV_CONFIG.timezone,
    databaseEngine: "PostgreSQL (Prisma ORM)",
    catalogCount: runtimeStore.products.length,
    maintenanceMode: runtimeStore.websiteSettings.MAINTENANCE_MODE === "true",
    timestamp: new Date().toISOString(),
  });
}
