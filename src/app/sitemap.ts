import { MetadataRoute } from "next";
import { INITIAL_CATALOG_DATA } from "@/config/catalog-seed-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://topupku.id";
  const staticPages = [
    "",
    "/games",
    "/promo",
    "/flash-sale",
    "/cek-transaksi",
    "/bantuan",
    "/faq",
    "/syarat-ketentuan",
    "/kebijakan-privasi",
  ];

  const entries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${baseUrl}${p}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: p === "" ? 1.0 : 0.8,
  }));

  for (const prod of INITIAL_CATALOG_DATA.products) {
    entries.push({
      url: `${baseUrl}/games/${prod.slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    });
    entries.push({
      url: `${baseUrl}/${prod.slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    });
  }

  return entries;
}
