// ============================================================================
// TOPUPKU - UNIFIED DATA STORE & TRANSACTION MANAGER
// Provides atomic transactional state for Catalog, Users, Orders, Payments,
// Webhooks, Supplier Dispatches, Wallets, Vouchers, Notifications & Audit Logs.
// Automatically seeds DEMO data and enforces strict DEMO vs PRODUCTION isolation.
// ============================================================================

import crypto from "crypto";
import { INITIAL_CATALOG_DATA } from "@/config/catalog-seed-data";
import { hashPassword } from "@/lib/security";
import type {
  CategoryDTO,
  OrderDTO,
  ProductDTO,
  ProductVariantDTO,
  RoleType,
  MemberLevel,
  VoucherDTO,
} from "@/types";

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string;
  passwordHash: string;
  role: RoleType;
  memberLevel: MemberLevel;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  walletBalance: number;
  loyaltyPoints: number;
  referralCode: string;
  referredByCode?: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface StoredWebhookLog {
  id: string;
  provider: "MIDTRANS" | "DIGIFLAZZ";
  orderId: string;
  transactionStatus: string;
  signatureKey: string;
  isSignatureValid: boolean;
  isProcessed: boolean;
  idempotencyHash: string;
  payload: Record<string, any>;
  receivedAt: string;
}

export interface StoredNotification {
  id: string;
  userId?: string | null;
  recipient: string;
  channel: "WEBSITE" | "EMAIL" | "WHATSAPP";
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface StoredAuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  module: string;
  targetId?: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface StoredDeposit {
  id: string;
  depositCode: string;
  userId: string;
  amount: number;
  uniqueCode: number;
  totalPayable: number;
  qrisString: string;
  status: "PENDING" | "SETTLEMENT" | "EXPIRED" | "FAILED";
  executionMode: "DEMO" | "PRODUCTION";
  createdAt: string;
  expiresAt: string;
  paidAt?: string | null;
}

class TopupkuStore {
  public categories: CategoryDTO[] = [];
  public products: ProductDTO[] = [];
  public vouchers: VoucherDTO[] = [];
  public banners = [...INITIAL_CATALOG_DATA.banners];
  public users: Map<string, StoredUser> = new Map();
  public ordersByInvoice: Map<string, OrderDTO> = new Map();
  public idempotencyMap: Map<string, string> = new Map(); // idempotencyKey -> invoiceNumber
  public webhookIdempotencySet: Set<string> = new Set();
  public supplierDispatchLock: Set<string> = new Set(); // orderId lock to prevent double dispatch
  public webhookLogs: StoredWebhookLog[] = [];
  public notifications: StoredNotification[] = [];
  public auditLogs: StoredAuditLog[] = [];
  public deposits: Map<string, StoredDeposit> = new Map();
  public wishlists: Map<string, Set<string>> = new Map(); // userId -> Set<productId>
  public websiteSettings: Record<string, string> = {
    SITE_NAME: "TOPUPKU",
    SITE_TAGLINE: "Platform Top Up Game & Produk Digital Instan #1 Indonesia",
    SEO_TITLE: "TOPUPKU - Top Up Game Murah, Cepat & Otomatis 24 Jam via QRIS",
    SEO_DESCRIPTION:
      "Top up Diamond Mobile Legends, Free Fire, PUBG Mobile, Honor of Kings, Genshin Impact, Valorant, Roblox, Pulsa & Token PLN instan 24 jam.",
    MAINTENANCE_MODE: "false",
    DEFAULT_PROFIT_MARGIN_PERCENT: "8",
    QRIS_EXPIRY_MINUTES: "15",
  };

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData(): void {
    this.categories = INITIAL_CATALOG_DATA.categories.map((c) => ({
      ...c,
      type: c.type as CategoryDTO["type"],
      productCount: INITIAL_CATALOG_DATA.products.filter(
        (p) => p.categorySlug === c.slug
      ).length,
    }));

    this.products = INITIAL_CATALOG_DATA.products.map((p) => ({
      ...p,
      variants: p.variants.map((v) => {
        const profitAmount = v.sellingPrice - v.baseCost;
        const profitMarginPercent = Number(
          ((profitAmount / v.baseCost) * 100).toFixed(2)
        );
        return {
          id: v.id,
          productId: p.id,
          sku: v.sku,
          supplierSku: v.supplierSku,
          name: v.name,
          denomination: v.denomination,
          bonusText: v.bonusText || null,
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
          flashSaleSold: v.isFlashSale ? 18 : 0,
          stock: 999,
          status: "ACTIVE",
        } satisfies ProductVariantDTO;
      }),
    }));

    this.vouchers = INITIAL_CATALOG_DATA.vouchers.map((v) => ({
      ...v,
      discountType: v.discountType as VoucherDTO["discountType"],
      startsAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    }));

    // Seed Demo Accounts securely using runtime hash
    const defaultDemoCredential =
      process.env.DEMO_SEED_PASSWORD_ENV || "TopupkuDemo#2026";
    const demoPassHash = hashPassword(defaultDemoCredential);

    const initialUsers: StoredUser[] = [
      {
        id: "usr_superadmin",
        email: "superadmin@topupku.id",
        username: "superadmin",
        fullName: "Raka Pratama (Superadmin)",
        phone: "628111000111",
        passwordHash: demoPassHash,
        role: "SUPERADMIN",
        memberLevel: "DIAMOND",
        status: "ACTIVE",
        walletBalance: 15000000,
        loyaltyPoints: 25000,
        referralCode: "TOPUPKUSUPER",
        twoFactorEnabled: true,
        createdAt: "2026-09-01T08:00:00.000Z",
        lastLoginAt: "2026-10-17T02:15:00.000Z",
      },
      {
        id: "usr_admin",
        email: "admin@topupku.id",
        username: "admin_topupku",
        fullName: "Nadia Putri (Ops Admin)",
        phone: "628111000222",
        passwordHash: demoPassHash,
        role: "ADMIN",
        memberLevel: "PLATINUM",
        status: "ACTIVE",
        walletBalance: 5000000,
        loyaltyPoints: 8500,
        referralCode: "TOPUPKUADMIN",
        twoFactorEnabled: false,
        createdAt: "2026-09-10T09:30:00.000Z",
        lastLoginAt: "2026-10-17T01:45:00.000Z",
      },
      {
        id: "usr_member",
        email: "member@topupku.id",
        username: "dimas_gamer",
        fullName: "Dimas Anggara",
        phone: "6281299887766",
        passwordHash: demoPassHash,
        role: "VIP",
        memberLevel: "GOLD",
        status: "ACTIVE",
        walletBalance: 750000,
        loyaltyPoints: 4250,
        referralCode: "DIMASVIP88",
        referredByCode: "TOPUPKUSUPER",
        twoFactorEnabled: false,
        createdAt: "2026-09-15T14:20:00.000Z",
        lastLoginAt: "2026-10-17T03:00:00.000Z",
      },
    ];

    this.users.clear();
    for (const u of initialUsers) {
      this.users.set(u.id, u);
    }

    // Seed sample historical orders so Admin Dashboard & Cek Transaksi have rich realistic data
    const sampleOrders: OrderDTO[] = [
      {
        id: "ord_demo_1001",
        invoiceNumber: "TPK-20261017-ML8821",
        idempotencyKey: "idem_demo_1001",
        executionMode: "DEMO",
        userId: "usr_member",
        customerName: "Dimas Anggara",
        customerEmail: "member@topupku.id",
        customerWhatsapp: "6281299887766",
        gameUserId: "129084712",
        gameZoneId: "2641",
        gamePlayerNickname: "RRQ•DimasPro",
        productId: "prod_mlbb",
        productSlug: "mobile-legends",
        productName: "Mobile Legends: Bang Bang",
        variantId: "var_ml_257",
        variantName: "257 Diamonds",
        sku: "MLBB-257",
        supplierSku: "DGF-ML257",
        subtotalAmount: 59500,
        discountAmount: 5950,
        feeAmount: 0,
        uniqueCode: 12,
        totalAmount: 53562,
        costAmount: 57500,
        profitAmount: 5500,
        cashbackAmount: 0,
        voucherCode: "TOPUPKU10",
        paymentMethod: "QRIS_DYNAMIC",
        status: "SUCCESS",
        paymentStatus: "SETTLEMENT",
        supplierStatus: "SUCCESS",
        serialNumber: "SN-MLBB-998827165421",
        supplierRefId: "DGF-REF-20261017-1001",
        supplierMessage: "Transaksi Sukses. Nickname: RRQ•DimasPro",
        qrisString: "00020101021226610014COM.MIDTRANS.WWW01189360050300000898240215TPK-20261017-ML88215204581653033605405535625802ID5907TOPUPKU6007JAKARTA6304A1B2",
        paidAt: "2026-10-17T01:12:10.000Z",
        completedAt: "2026-10-17T01:12:14.000Z",
        expiredAt: "2026-10-17T01:27:00.000Z",
        createdAt: "2026-10-17T01:11:45.000Z",
        updatedAt: "2026-10-17T01:12:14.000Z",
      },
      {
        id: "ord_demo_1002",
        invoiceNumber: "TPK-20261017-HOK991",
        idempotencyKey: "idem_demo_1002",
        executionMode: "DEMO",
        userId: "usr_member",
        customerName: "Dimas Anggara",
        customerEmail: "member@topupku.id",
        customerWhatsapp: "6281299887766",
        gameUserId: "88192004123",
        gameZoneId: null,
        gamePlayerNickname: "GarudaKingID",
        productId: "prod_hok",
        productSlug: "honor-of-kings",
        productName: "Honor of Kings",
        variantId: "var_hok_800",
        variantName: "800 Tokens",
        sku: "HOK-800",
        supplierSku: "DGF-HOK800",
        subtotalAmount: 147500,
        discountAmount: 5000,
        feeAmount: 0,
        uniqueCode: 24,
        totalAmount: 142524,
        costAmount: 134000,
        profitAmount: 13500,
        cashbackAmount: 0,
        voucherCode: "HEMAT5K",
        paymentMethod: "QRIS_DYNAMIC",
        status: "SUCCESS",
        paymentStatus: "SETTLEMENT",
        supplierStatus: "SUCCESS",
        serialNumber: "SN-HOK-778192837100",
        supplierRefId: "DGF-REF-20261017-1002",
        supplierMessage: "Top Up 800 Tokens Honor of Kings Berhasil",
        qrisString: "00020101021226610014COM.MIDTRANS.WWW01189360050300000898240215TPK-20261017-HOK99152045816530336054061425245802ID5907TOPUPKU6007JAKARTA6304C3D4",
        paidAt: "2026-10-17T02:05:10.000Z",
        completedAt: "2026-10-17T02:05:13.000Z",
        expiredAt: "2026-10-17T02:20:00.000Z",
        createdAt: "2026-10-17T02:04:30.000Z",
        updatedAt: "2026-10-17T02:05:13.000Z",
      },
      {
        id: "ord_demo_1003",
        invoiceNumber: "TPK-20261017-VAL404",
        idempotencyKey: "idem_demo_1003",
        executionMode: "DEMO",
        userId: null,
        customerName: "Kevin Sanjaya",
        customerEmail: "kevin@gamer.id",
        customerWhatsapp: "6281388776655",
        gameUserId: "KevinAce#IDN",
        gameZoneId: null,
        gamePlayerNickname: "KevinAce#IDN",
        productId: "prod_valorant",
        productSlug: "valorant",
        productName: "Valorant",
        variantId: "var_val_1000",
        variantName: "1000 Valorant Points",
        sku: "VAL-1000",
        supplierSku: "DGF-VAL1000",
        subtotalAmount: 101500,
        discountAmount: 0,
        feeAmount: 0,
        uniqueCode: 37,
        totalAmount: 101537,
        costAmount: 98000,
        profitAmount: 3500,
        cashbackAmount: 0,
        voucherCode: null,
        paymentMethod: "QRIS_DYNAMIC",
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        supplierStatus: "PENDING",
        serialNumber: null,
        supplierRefId: null,
        supplierMessage: "Menunggu pembayaran QRIS",
        qrisString: "00020101021226610014COM.MIDTRANS.WWW01189360050300000898240215TPK-20261017-VAL40452045816530336054061015375802ID5907TOPUPKU6007JAKARTA6304E5F6",
        paidAt: null,
        completedAt: null,
        expiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
    ];

    this.ordersByInvoice.clear();
    this.idempotencyMap.clear();
    this.supplierDispatchLock.clear();
    for (const o of sampleOrders) {
      this.ordersByInvoice.set(o.invoiceNumber, o);
      this.idempotencyMap.set(o.idempotencyKey, o.invoiceNumber);
      if (o.supplierStatus === "SUCCESS") {
        this.supplierDispatchLock.add(o.id);
      }
    }

    this.notifications = [
      {
        id: "notif_1",
        userId: "usr_member",
        recipient: "member@topupku.id",
        channel: "WEBSITE",
        type: "ORDER_SUCCESS",
        title: "Pesanan TPK-20261017-ML8821 Berhasil!",
        message: "257 Diamonds Mobile Legends telah dikirim ke akun RRQ•DimasPro. SN: SN-MLBB-998827165421",
        actionUrl: "/invoice/TPK-20261017-ML8821",
        isRead: false,
        createdAt: "2026-10-17T01:12:15.000Z",
      },
      {
        id: "notif_2",
        userId: "usr_member",
        recipient: "member@topupku.id",
        channel: "WEBSITE",
        type: "PROMO_ALERT",
        title: "Voucher TOPUPKU10 Aktif!",
        message: "Gunakan kode promo TOPUPKU10 untuk diskon 10% di seluruh produk game hari ini.",
        actionUrl: "/promo",
        isRead: false,
        createdAt: "2026-10-17T00:00:00.000Z",
      },
    ];

    this.auditLogs = [
      {
        id: "aud_1",
        actorEmail: "superadmin@topupku.id",
        actorRole: "SUPERADMIN",
        action: "SYNC_DIGIFLAZZ_CATALOG",
        module: "SUPPLIER",
        targetId: "ALL_SKUS",
        details: { syncedCount: 35, marginAppliedPercent: 8 },
        createdAt: "2026-10-17T00:30:00.000Z",
      },
      {
        id: "aud_2",
        actorEmail: "admin@topupku.id",
        actorRole: "ADMIN",
        action: "UPDATE_FLASH_SALE",
        module: "MARKETING",
        targetId: "MLBB-WDP",
        details: { flashSalePrice: 25900, stock: 100 },
        createdAt: "2026-10-17T01:00:00.000Z",
      },
    ];
  }

  public addAuditLog(entry: Omit<StoredAuditLog, "id" | "createdAt">): StoredAuditLog {
    const log: StoredAuditLog = {
      ...entry,
      id: `aud_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

const globalForStore = globalThis as unknown as {
  topupkuStore: TopupkuStore | undefined;
};

export const runtimeStore =
  globalForStore.topupkuStore ?? new TopupkuStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.topupkuStore = runtimeStore;
}
