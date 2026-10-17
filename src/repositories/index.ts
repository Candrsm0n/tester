// ============================================================================
// TOPUPKU - REPOSITORY LAYER (Catalog, Order, User & Admin Analytics)
// ============================================================================

import { runtimeStore } from "@/lib/db/runtime-store";
import type { OrderDTO, ProductDTO } from "@/types";

export const CatalogRepository = {
  getAllCategories() {
    return runtimeStore.categories;
  },

  getAllProducts(filters?: {
    category?: string;
    search?: string;
    popularOnly?: boolean;
    newOnly?: boolean;
    flashSaleOnly?: boolean;
    sort?: "popular" | "rating" | "name" | "price-asc";
  }): ProductDTO[] {
    let list = [...runtimeStore.products];

    if (filters?.category && filters.category !== "all") {
      list = list.filter((p) => p.categorySlug === filters.category);
    }
    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.publisher.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    if (filters?.popularOnly) {
      list = list.filter((p) => p.isPopular);
    }
    if (filters?.newOnly) {
      list = list.filter((p) => p.isNew);
    }
    if (filters?.flashSaleOnly) {
      list = list.filter((p) => p.variants.some((v) => v.isFlashSale));
    }

    if (filters?.sort === "popular") {
      list.sort((a, b) => b.totalSold - a.totalSold);
    } else if (filters?.sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filters?.sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters?.sort === "price-asc") {
      list.sort(
        (a, b) =>
          (a.variants[0]?.sellingPrice || 0) - (b.variants[0]?.sellingPrice || 0)
      );
    }

    return list;
  },

  getProductBySlug(slug: string): ProductDTO | null {
    return runtimeStore.products.find((p) => p.slug === slug) || null;
  },

  getFlashSaleVariants() {
    const items: Array<{
      product: ProductDTO;
      variant: ProductDTO["variants"][number];
    }> = [];
    for (const p of runtimeStore.products) {
      for (const v of p.variants) {
        if (v.isFlashSale && v.flashSalePrice) {
          items.push({ product: p, variant: v });
        }
      }
    }
    return items;
  },
};

export const OrderRepository = {
  getAllOrders(filters?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): OrderDTO[] {
    let orders = Array.from(runtimeStore.ordersByInvoice.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filters?.status && filters.status !== "ALL") {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.gameUserId.toLowerCase().includes(q) ||
          o.customerWhatsapp.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q)
      );
    }
    if (filters?.startDate) {
      const startMs = new Date(filters.startDate).getTime();
      if (!Number.isNaN(startMs)) {
        orders = orders.filter((o) => new Date(o.createdAt).getTime() >= startMs);
      }
    }
    if (filters?.endDate) {
      const endMs = new Date(filters.endDate).getTime() + 86400000;
      if (!Number.isNaN(endMs)) {
        orders = orders.filter((o) => new Date(o.createdAt).getTime() <= endMs);
      }
    }

    return orders;
  },

  getOrderByInvoice(invoiceNumber: string): OrderDTO | null {
    return runtimeStore.ordersByInvoice.get(invoiceNumber.toUpperCase()) || null;
  },

  getAdminDashboardStats() {
    const allOrders = Array.from(runtimeStore.ordersByInvoice.values());
    const successOrders = allOrders.filter((o) => o.status === "SUCCESS");
    const pendingOrders = allOrders.filter(
      (o) => o.status === "PENDING_PAYMENT" || o.status === "PROCESSING_SUPPLIER"
    );
    const failedOrders = allOrders.filter(
      (o) => o.status === "FAILED" || o.status === "EXPIRED"
    );

    const totalRevenue = successOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalProfit = successOrders.reduce((acc, o) => acc + o.profitAmount, 0);

    const chartSeries = [
      { date: "11 Okt", revenue: 14250000, profit: 1180000, transactions: 184 },
      { date: "12 Okt", revenue: 16890000, profit: 1410000, transactions: 215 },
      { date: "13 Okt", revenue: 15400000, profit: 1290000, transactions: 198 },
      { date: "14 Okt", revenue: 19250000, profit: 1640000, transactions: 249 },
      { date: "15 Okt", revenue: 22480000, profit: 1920000, transactions: 286 },
      { date: "16 Okt", revenue: 25120000, profit: 2180000, transactions: 318 },
      {
        date: "17 Okt",
        revenue: 28450000 + totalRevenue,
        profit: 2460000 + totalProfit,
        transactions: 342 + allOrders.length,
      },
    ];

    const bestSellers = [...runtimeStore.products]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        totalSold: p.totalSold,
        rating: p.rating,
      }));

    return {
      totalRevenue: 141840000 + totalRevenue,
      totalProfit: 12080000 + totalProfit,
      totalTransactions: 1792 + allOrders.length,
      successTransactions: 1745 + successOrders.length,
      pendingTransactions: pendingOrders.length,
      failedTransactions: 44 + failedOrders.length,
      totalUsers: runtimeStore.users.size + 1240,
      newUsersToday: 38,
      chartSeries,
      bestSellers,
    };
  },
};
