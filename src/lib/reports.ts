// Renter-reported price observations: validation + public aggregation.
// Pure module — no fs, no database — so it can be unit-tested and shared
// between the API route (server) and the submission form (client).
import { median } from "./benchmarks";

export const REPORT_STATUSES = ["pending", "approved", "rejected", "needs_clarification"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_BASES = ["asking", "paid", "unknown"] as const;
export type ReportBasis = (typeof REPORT_BASES)[number];

export const BASIS_LABEL: Record<ReportBasis, string> = {
  asking: "Asking price advertised or quoted to me",
  paid: "Rent I actually paid / a confirmed agreement",
  unknown: "I am not sure which of these it is",
};

export const RENT_MIN_REPORT = 1;
export const RENT_MAX_REPORT = 1_000_000;
export const MAX_ROOM_TYPE = 80;
export const MAX_CONTEXT = 500;
export const MAX_CONTACT = 120;
export const EARLIEST_OBSERVATION = "2000-01-01";

export interface ReportDraft {
  areaSlug: string;
  roomType: string;
  observedRent: number;
  observedOn: string;
  basis: ReportBasis;
  sourceContext: string;
  contact: string;
}

export interface PublishedOptions {
  areas: string[];
  roomTypes: string[];
}

export type ReportErrors = Partial<Record<"areaSlug" | "roomType" | "observedRent" | "observedOn" | "basis" | "sourceContext" | "contact", string>>;

export type ValidationResult = { ok: true; value: ReportDraft } | { ok: false; errors: ReportErrors };

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * Server-side validation for a renter price report.
 * `today` is injected so the rule is testable and never depends on a clock read
 * inside the validator.
 */
export function validateReport(raw: Record<string, unknown>, published: PublishedOptions, today: string): ValidationResult {
  const errors: ReportErrors = {};

  const areaSlug = clean(raw.areaSlug ?? raw.area_slug, 80);
  const roomType = clean(raw.roomType ?? raw.room_type, MAX_ROOM_TYPE);
  const observedOn = clean(raw.observedOn ?? raw.observed_on, 10);
  const basis = clean(raw.basis, 20) as ReportBasis;
  const sourceContext = clean(raw.sourceContext ?? raw.source_context, MAX_CONTEXT);
  const contact = clean(raw.contact, MAX_CONTACT);

  const rawRent = raw.observedRent ?? raw.observed_rent;
  const rentText =
    typeof rawRent === "number" && Number.isFinite(rawRent)
      ? String(rawRent)
      : clean(rawRent, 20).replace(/[,\s₵]/g, "").replace(/^gh/i, "");
  const observedRent = Number(rentText);

  if (!areaSlug || !published.areas.includes(areaSlug)) errors.areaSlug = "Choose one of the areas TrueCost publishes.";
  if (!roomType || !published.roomTypes.includes(roomType)) errors.roomType = "Choose a room type TrueCost publishes.";

  if (rentText === "" || !Number.isFinite(observedRent)) {
    errors.observedRent = "Enter the monthly rent you saw, in Ghana cedis.";
  } else if (observedRent < RENT_MIN_REPORT || observedRent > RENT_MAX_REPORT) {
    errors.observedRent = "Enter a monthly rent between GH₵1 and GH₵1,000,000.";
  }

  if (!isIsoDate(observedOn)) {
    errors.observedOn = "Enter the date you saw this price.";
  } else if (observedOn < EARLIEST_OBSERVATION) {
    errors.observedOn = "That date is too far in the past to use.";
  } else if (observedOn > today) {
    errors.observedOn = "The date cannot be in the future.";
  }

  if (!REPORT_BASES.includes(basis)) errors.basis = "Tell us whether this was an asking price or a rent actually paid.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, value: { areaSlug, roomType, observedRent, observedOn, basis, sourceContext, contact } };
}

/** Strip every private field so a report row can never leak contact details. */
export function publicReportFields(row: Record<string, unknown>): Record<string, unknown> {
  const { contact, source_context, ip, ...safe } = row as Record<string, unknown>;
  void contact;
  void source_context;
  void ip;
  return safe;
}

export interface ApprovedGroup {
  roomType: string;
  count: number;
  min: number;
  max: number;
  median: number;
  firstObserved: string;
  lastObserved: string;
  basisCounts: Record<ReportBasis, number>;
}

export interface ApprovedSummary {
  areaSlug: string;
  total: number;
  groups: ApprovedGroup[];
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Aggregate owner-approved reports for one area.
 *
 * Pending, rejected and "needs clarification" rows are never included, and no
 * trend is derived: the output is a count, a spread and the observation window.
 */
export function summariseApproved(rows: Record<string, unknown>[], areaSlug: string): ApprovedSummary {
  const approved = rows.filter(
    (row) => str(row.area_slug) === areaSlug && str(row.status) === "approved",
  );

  const grouped = new Map<string, Record<string, unknown>[]>();
  for (const row of approved) {
    const type = str(row.room_type) || "Unrecorded room type";
    const list = grouped.get(type) ?? [];
    list.push(row);
    grouped.set(type, list);
  }

  const groups: ApprovedGroup[] = [...grouped.entries()]
    .map(([roomType, list]) => {
      const rents = list.map((row) => num(row.observed_rent)).sort((a, b) => a - b);
      const dates = list.map((row) => str(row.observed_on)).filter(Boolean).sort();
      const basisCounts: Record<ReportBasis, number> = { asking: 0, paid: 0, unknown: 0 };
      for (const row of list) {
        const basis = str(row.basis) as ReportBasis;
        if (basis in basisCounts) basisCounts[basis] += 1;
      }
      return {
        roomType,
        count: list.length,
        min: rents[0] ?? 0,
        max: rents[rents.length - 1] ?? 0,
        median: median(rents),
        firstObserved: dates[0] ?? "",
        lastObserved: dates[dates.length - 1] ?? "",
        basisCounts,
      };
    })
    .sort((a, b) => b.count - a.count || a.roomType.localeCompare(b.roomType));

  return { areaSlug, total: approved.length, groups };
}
