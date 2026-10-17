// ============================================================================
// TOPUPKU - CORE DOMAIN TYPES (Strict TypeScript)
// ============================================================================

export type AppExecutionMode = "DEMO" | "PRODUCTION";

export type RoleType = "USER" | "RESELLER" | "VIP" | "ADMIN" | "SUPERADMIN";

export type MemberLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "BANNED";

export type CategoryType =
  | "GAME_MOBILE"
  | "GAME_PC"
  | "PULSA"
  | "PAKET_DATA"
  | "TOKEN_PLN"
  | "VOUCHER_DIGITAL"
  | "EWALLET";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "MAINTENANCE";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING_SUPPLIER"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED";

export type PaymentMethodType =
  | "QRIS_DYNAMIC"
  | "WALLET_BALANCE"
  | "VIRTUAL_ACCOUNT"
  | "EWALLET";

export type PaymentStatus =
  | "PENDING"
  | "SETTLEMENT"
  | "EXPIRED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type SupplierStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "CASHBACK";

export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  supplierSku: string;
  name: string;
  denomination: string;
  bonusText?: string | null;
  iconType: string;
  baseCost: number;
  sellingPrice: number;
  resellerPrice: number;
  vipPrice: number;
  profitMarginPercent: number;
  profitAmount: number;
  isFlashSale: boolean;
  flashSalePrice?: number | null;
  flashSaleStock?: number | null;
  flashSaleSold: number;
  stock: number;
  status: ProductStatus;
}

export interface ProductDTO {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  slug: string;
  publisher: string;
  subtitle?: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl: string;
  requiresZoneId: boolean;
  zoneIdLabel?: string;
  userIdLabel: string;
  userIdPlaceholder: string;
  zoneIdPlaceholder?: string;
  zoneOptions?: Array<{ label: string; value: string }>;
  instructionText: string;
  supportsIdCheck: boolean;
  isPopular: boolean;
  isNew: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  totalSold: number;
  status: ProductStatus;
  variants: ProductVariantDTO[];
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  icon: string;
  description: string;
  sortOrder: number;
  productCount?: number;
}

export interface VoucherDTO {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minTransaction: number;
  categorySlug?: string | null;
  minMemberLevel: MemberLevel;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
}

export interface OrderDTO {
  id: string;
  invoiceNumber: string;
  idempotencyKey: string;
  executionMode: AppExecutionMode;
  userId?: string | null;
  customerName?: string | null;
  customerEmail: string;
  customerWhatsapp: string;
  gameUserId: string;
  gameZoneId?: string | null;
  gamePlayerNickname?: string | null;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  supplierSku: string;
  subtotalAmount: number;
  discountAmount: number;
  feeAmount: number;
  uniqueCode: number;
  totalAmount: number;
  costAmount: number;
  profitAmount: number;
  cashbackAmount: number;
  voucherCode?: string | null;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  supplierStatus: SupplierStatus;
  serialNumber?: string | null;
  supplierRefId?: string | null;
  supplierMessage?: string | null;
  qrisString: string;
  qrisImageUrl?: string | null;
  paidAt?: string | null;
  completedAt?: string | null;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string | null;
  role: RoleType;
  memberLevel: MemberLevel;
  walletBalance: number;
  loyaltyPoints: number;
  referralCode: string;
}
