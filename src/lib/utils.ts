// ============================================================================
// TOPUPKU - FORMATTING, CURRENCY (IDR), TIMEZONE (Asia/Jakarta) & UI HELPERS
// ============================================================================

export function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatRupiah(amount: number | string): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(numeric)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(numeric));
}

export function formatJakartaDateTime(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d) + " WIB";
}

export function generateInvoiceNumber(prefix = "TPK"): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${y}${m}${d}-${rand}`;
}
