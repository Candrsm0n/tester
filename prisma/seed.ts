// ============================================================================
// TOPUPKU - DATABASE SEED SCRIPT (prisma/seed.ts)
// Seeds roles, demo accounts (hashed securely at runtime), categories,
// 11 products & variants, vouchers, banners, promotions, and settings.
// ============================================================================

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { INITIAL_CATALOG_DATA } from "../src/config/catalog-seed-data";

const prisma = new PrismaClient();

function hashPasswordSecure(rawPassword: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(rawPassword, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

async function main() {
  console.log("🚀 Starting TOPUPKU PostgreSQL Database Seeding...");

  // 1. Seed Roles
  const roleDefinitions = [
    {
      name: "SUPERADMIN" as const,
      displayName: "Super Administrator",
      description: "Full access to system settings, integrations, audit logs, and user roles",
      permissions: ["*"],
    },
    {
      name: "ADMIN" as const,
      displayName: "Administrator",
      description: "Manage products, transactions, users, promos, and payments",
      permissions: ["products:*", "orders:*", "users:read", "promos:*", "payments:*"],
    },
    {
      name: "VIP" as const,
      displayName: "VIP Member",
      description: "Exclusive lowest VIP pricing tier and priority support",
      permissions: ["member:*", "pricing:vip"],
    },
    {
      name: "RESELLER" as const,
      displayName: "Reseller Partner",
      description: "Wholesale reseller pricing tier for high-volume transactions",
      permissions: ["member:*", "pricing:reseller"],
    },
    {
      name: "USER" as const,
      displayName: "Regular Member",
      description: "Standard registered member account",
      permissions: ["member:*"],
    },
  ];

  const rolesMap: Record<string, string> = {};
  for (const r of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, permissions: r.permissions },
      create: r,
    });
    rolesMap[r.name] = role.id;
  }

  // 2. Seed Safe Demo Accounts (Password generated from env or default demo setup credential)
  const rawSeedCredential = process.env.DEMO_SEED_PASSWORD_ENV || crypto.randomBytes(12).toString("base64url");
  const passwordHash = hashPasswordSecure(rawSeedCredential);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@topupku.id" },
    update: {},
    create: {
      email: "superadmin@topupku.id",
      username: "superadmin",
      fullName: "Raka Pratama (Superadmin)",
      phone: "628111000111",
      passwordHash,
      roleId: rolesMap.SUPERADMIN,
      roleType: "SUPERADMIN",
      memberLevel: "DIAMOND",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      loyaltyPoints: 25000,
      referralCode: "TOPUPKUSUPER",
      wallet: {
        create: {
          balance: 15000000,
          points: 25000,
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@topupku.id" },
    update: {},
    create: {
      email: "admin@topupku.id",
      username: "admin_topupku",
      fullName: "Nadia Putri (Ops Admin)",
      phone: "628111000222",
      passwordHash,
      roleId: rolesMap.ADMIN,
      roleType: "ADMIN",
      memberLevel: "PLATINUM",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      loyaltyPoints: 8500,
      referralCode: "TOPUPKUADMIN",
      wallet: {
        create: {
          balance: 5000000,
          points: 8500,
        },
      },
    },
  });

  const demoMember = await prisma.user.upsert({
    where: { email: "member@topupku.id" },
    update: {},
    create: {
      email: "member@topupku.id",
      username: "dimas_gamer",
      fullName: "Dimas Anggara",
      phone: "6281299887766",
      passwordHash,
      roleId: rolesMap.VIP,
      roleType: "VIP",
      memberLevel: "GOLD",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      loyaltyPoints: 4250,
      referralCode: "DIMASVIP88",
      referredById: superAdmin.id,
      wallet: {
        create: {
          balance: 750000,
          points: 4250,
        },
      },
    },
  });

  // 3. Seed Categories & Products from INITIAL_CATALOG_DATA
  for (const cat of INITIAL_CATALOG_DATA.categories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        type: cat.type as any,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        type: cat.type as any,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });

    const catProducts = INITIAL_CATALOG_DATA.products.filter((p) => p.categorySlug === cat.slug);
    for (const prod of catProducts) {
      const savedProduct = await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {
          name: prod.name,
          publisher: prod.publisher,
          subtitle: prod.subtitle,
          description: prod.description,
          thumbnailUrl: prod.thumbnailUrl,
          bannerUrl: prod.bannerUrl,
          requiresZoneId: prod.requiresZoneId,
          zoneIdLabel: prod.zoneIdLabel,
          userIdLabel: prod.userIdLabel,
          userIdPlaceholder: prod.userIdPlaceholder,
          zoneIdPlaceholder: prod.zoneIdPlaceholder,
          instructionText: prod.instructionText,
          supportsIdCheck: prod.supportsIdCheck,
          isPopular: prod.isPopular,
          isNew: prod.isNew,
          isFeatured: prod.isFeatured,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          totalSold: prod.totalSold,
        },
        create: {
          categoryId: savedCategory.id,
          name: prod.name,
          slug: prod.slug,
          publisher: prod.publisher,
          subtitle: prod.subtitle,
          description: prod.description,
          thumbnailUrl: prod.thumbnailUrl,
          bannerUrl: prod.bannerUrl,
          requiresZoneId: prod.requiresZoneId,
          zoneIdLabel: prod.zoneIdLabel,
          userIdLabel: prod.userIdLabel,
          userIdPlaceholder: prod.userIdPlaceholder,
          zoneIdPlaceholder: prod.zoneIdPlaceholder,
          instructionText: prod.instructionText,
          supportsIdCheck: prod.supportsIdCheck,
          isPopular: prod.isPopular,
          isNew: prod.isNew,
          isFeatured: prod.isFeatured,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          totalSold: prod.totalSold,
        },
      });

      for (const [idx, v] of prod.variants.entries()) {
        const profitAmount = v.sellingPrice - v.baseCost;
        const profitMarginPercent = Number(((profitAmount / v.baseCost) * 100).toFixed(2));
        await prisma.productVariant.upsert({
          where: { sku: v.sku },
          update: {
            name: v.name,
            denomination: v.denomination,
            bonusText: v.bonusText,
            baseCost: v.baseCost,
            sellingPrice: v.sellingPrice,
            resellerPrice: v.resellerPrice,
            vipPrice: v.vipPrice,
            profitMarginPercent,
            profitAmount,
            isFlashSale: Boolean(v.isFlashSale),
            flashSalePrice: v.flashSalePrice ?? null,
            flashSaleStock: v.flashSaleStock ?? null,
            sortOrder: idx + 1,
          },
          create: {
            productId: savedProduct.id,
            sku: v.sku,
            supplierSku: v.supplierSku,
            name: v.name,
            denomination: v.denomination,
            bonusText: v.bonusText,
            iconType: v.iconType || "DIAMOND",
            baseCost: v.baseCost,
            sellingPrice: v.sellingPrice,
            resellerPrice: v.resellerPrice,
            vipPrice: v.vipPrice,
            profitMarginPercent,
            profitAmount,
            isFlashSale: Boolean(v.isFlashSale),
            flashSalePrice: v.flashSalePrice ?? null,
            flashSaleStock: v.flashSaleStock ?? null,
            sortOrder: idx + 1,
          },
        });
      }
    }
  }

  // 4. Seed Vouchers
  for (const v of INITIAL_CATALOG_DATA.vouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: {
        title: v.title,
        description: v.description,
        discountType: v.discountType as any,
        discountValue: v.discountValue,
        maxDiscountAmount: v.maxDiscountAmount,
        minTransaction: v.minTransaction,
        usageLimit: v.usageLimit,
      },
      create: {
        code: v.code,
        title: v.title,
        description: v.description,
        discountType: v.discountType as any,
        discountValue: v.discountValue,
        maxDiscountAmount: v.maxDiscountAmount,
        minTransaction: v.minTransaction,
        usageLimit: v.usageLimit,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  // 5. Seed Banners
  for (const b of INITIAL_CATALOG_DATA.banners) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: {
        title: b.title,
        subtitle: b.subtitle,
        badgeText: b.badgeText,
        imageUrl: b.imageUrl,
        ctaText: b.ctaText,
        ctaUrl: b.ctaUrl,
        gradientCss: b.gradientCss,
        sortOrder: b.sortOrder,
      },
      create: {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        badgeText: b.badgeText,
        imageUrl: b.imageUrl,
        ctaText: b.ctaText,
        ctaUrl: b.ctaUrl,
        gradientCss: b.gradientCss,
        sortOrder: b.sortOrder,
      },
    });
  }

  // 6. Seed Website Settings
  const defaultSettings = [
    { key: "SITE_NAME", value: "TOPUPKU", group: "GENERAL", isSecret: false },
    { key: "SITE_TAGLINE", value: "Platform Top Up Game & Produk Digital Instan #1 Indonesia", group: "GENERAL", isSecret: false },
    { key: "SEO_TITLE", value: "TOPUPKU - Top Up Game Murah, Cepat & Otomatis 24 Jam via QRIS", group: "SEO", isSecret: false },
    { key: "SEO_DESCRIPTION", value: "Top up Diamond Mobile Legends, Free Fire, PUBG Mobile, Honor of Kings, Genshin Impact, Valorant, Roblox, Pulsa & Token PLN instan 24 jam.", group: "SEO", isSecret: false },
    { key: "MAINTENANCE_MODE", value: "false", group: "SECURITY", isSecret: false },
    { key: "DEFAULT_PROFIT_MARGIN_PERCENT", value: "8", group: "SUPPLIER", isSecret: false },
    { key: "QRIS_EXPIRY_MINUTES", value: "15", group: "PAYMENT", isSecret: false },
  ];

  for (const s of defaultSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("✅ TOPUPKU Database Seed Completed Successfully!");
  console.log("   Accounts created: superadmin@topupku.id, admin@topupku.id, member@topupku.id");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
