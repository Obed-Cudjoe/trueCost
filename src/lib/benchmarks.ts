// Shared, dependency-free helpers for money, ranges and room-type matching.
// Safe to import from client components (no fs, no server-only code).

/** Ghana cedi formatting used across the site. */
export function formatGhs(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return "GH₵" + Math.round(value).toLocaleString("en-GH");
}

export interface MoneyRange {
  min: number;
  max: number;
}

/**
 * Parse a written range such as "GH₵800–1,500" or "2500-5000".
 * Returns null when the text is not a usable range, so callers can say
 * "not recorded" instead of inventing a figure.
 */
export function parseMoneyRange(text: string): MoneyRange | null {
  if (!text) return null;
  const cleaned = text.replace(/[₵\s]/g, "").replace(/gh/i, "");
  const parts = cleaned
    .replace(/[–—]/g, "-")
    .split("-")
    .map((part) => part.replace(/,/g, "").trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  const numbers = parts.map((part) => Number(part)).filter((n) => Number.isFinite(n) && n >= 0);
  if (numbers.length === 0) return null;
  const min = Math.min(...numbers);
  const max = numbers.length > 1 ? Math.max(...numbers) : min;
  if (max < min) return null;
  return { min, max };
}

export type RoomFamily = "single" | "chamber" | "two-bed" | "three-bed" | "shared" | "other";

/** Display order for room-type families, broadest comparison first. */
export const FAMILY_ORDER: RoomFamily[] = ["single", "chamber", "two-bed", "three-bed", "shared", "other"];

export const FAMILY_LABEL: Record<RoomFamily, string> = {
  single: "Single room / self-contain",
  chamber: "Chamber & hall",
  "two-bed": "2-bedroom",
  "three-bed": "3-bedroom",
  shared: "Shared / hostel-style",
  other: "Other recorded type",
};

/**
 * Group equivalent-but-differently-worded room types, e.g.
 * "2-bedroom house" and "2-bedroom (gated)" both map to "two-bed".
 * Used to line up comparison rows without silently merging unlike units.
 */
export function roomTypeFamily(label: string): RoomFamily {
  const t = label.toLowerCase();
  if (t.includes("chamber")) return "chamber";
  if (t.includes("3") && t.includes("bed")) return "three-bed";
  if (t.includes("2") && t.includes("bed")) return "two-bed";
  if (t.includes("shared") || t.includes("hostel")) return "shared";
  if (t.includes("single")) return "single";
  return "other";
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Turn any user-supplied number into a sane, bounded value. */
export function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
