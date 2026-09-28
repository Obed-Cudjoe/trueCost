// Move-in cost maths and the sourced advance-rent flag.
// Pure functions only — no fs, no React — so the logic can be unit-tested.
import { clampNumber } from "./benchmarks";

export const RIGHTS_ADVANCE_URL = "/rights/six-month-cap";

export const ADVANCE_MONTHS_MIN = 1;
export const ADVANCE_MONTHS_MAX = 36;
export const RENT_MIN = 0;
export const RENT_MAX = 1_000_000;
export const FEE_MAX = 1_000_000;
export const COMMISSION_MAX_PERCENT = 100;

export interface MoveInInputs {
  /** Low end of the recorded benchmark range for the chosen area + room type. */
  rentLow: number;
  /** High end of the recorded benchmark range. */
  rentHigh: number;
  /** Rent typed by the visitor. When present it replaces the benchmark range. */
  rentOverride?: number | null;
  /** Advance months being demanded or planned for. */
  months: number;
  /** Agent commission as a fraction, e.g. 0.1 for 10%. */
  commissionRate: number;
  viewingFee: number;
  movingFee: number;
}

export type LineSource = "benchmark" | "you" | "assumption";

export interface LineItem {
  key: string;
  label: string;
  low: number;
  high: number;
  source: LineSource;
  note?: string;
}

export interface MoveInResult {
  /** True when the visitor typed their own rent, so there is one figure, not a range. */
  singleFigure: boolean;
  rentLow: number;
  rentHigh: number;
  advanceLow: number;
  advanceHigh: number;
  commissionLow: number;
  commissionHigh: number;
  viewingFee: number;
  movingFee: number;
  totalLow: number;
  totalHigh: number;
  lines: LineItem[];
}

function safe(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Compute the move-in total.
 *
 * - When the rent comes from the site benchmark the result is a low-to-high band,
 *   because the underlying record is a range and not a quote.
 * - When the visitor typed a rent the result is a single figure built on their entry.
 * - Every line records whether it came from the benchmark, the visitor, or an
 *   editable planning assumption, so the UI can label them apart.
 */
export function computeMoveInCost(input: MoveInInputs): MoveInResult {
  const months = Math.round(clampNumber(safe(input.months, 1), ADVANCE_MONTHS_MIN, ADVANCE_MONTHS_MAX, 1));
  const rate = clampNumber(safe(input.commissionRate), 0, COMMISSION_MAX_PERCENT / 100, 0);
  const viewingFee = clampNumber(safe(input.viewingFee), 0, FEE_MAX, 0);
  const movingFee = clampNumber(safe(input.movingFee), 0, FEE_MAX, 0);

  const override = typeof input.rentOverride === "number" && Number.isFinite(input.rentOverride) ? input.rentOverride : null;
  const singleFigure = override !== null;

  const benchmarkLow = clampNumber(safe(input.rentLow), RENT_MIN, RENT_MAX, 0);
  const benchmarkHigh = Math.max(benchmarkLow, clampNumber(safe(input.rentHigh), RENT_MIN, RENT_MAX, benchmarkLow));

  const rentLow = singleFigure ? clampNumber(override as number, RENT_MIN, RENT_MAX, 0) : benchmarkLow;
  const rentHigh = singleFigure ? rentLow : benchmarkHigh;

  const advanceLow = rentLow * months;
  const advanceHigh = rentHigh * months;
  const commissionLow = advanceLow * rate;
  const commissionHigh = advanceHigh * rate;

  const totalLow = advanceLow + commissionLow + viewingFee + movingFee;
  const totalHigh = advanceHigh + commissionHigh + viewingFee + movingFee;

  const lines: LineItem[] = [
    {
      key: "rent",
      label: `Monthly rent × 1 month`,
      low: rentLow,
      high: rentHigh,
      source: singleFigure ? "you" : "benchmark",
      note: singleFigure ? "Rent you entered" : "Recorded benchmark range for this area and room type",
    },
    {
      key: "advance",
      label: `Advance rent × ${months} month${months === 1 ? "" : "s"}`,
      low: advanceLow,
      high: advanceHigh,
      source: singleFigure ? "you" : "benchmark",
      note: `${months} month${months === 1 ? "" : "s"} is your entry`,
    },
    {
      key: "commission",
      label: `Agent commission at ${Math.round(rate * 100)}%`,
      low: commissionLow,
      high: commissionHigh,
      source: "assumption",
      note: "Editable planning assumption — not a quoted market fact",
    },
    {
      key: "viewing",
      label: "Viewing / inspection costs",
      low: viewingFee,
      high: viewingFee,
      source: "assumption",
      note: "Editable planning assumption",
    },
    {
      key: "moving",
      label: "Moving and logistics",
      low: movingFee,
      high: movingFee,
      source: "assumption",
      note: "Editable planning assumption",
    },
  ];

  return {
    singleFigure,
    rentLow,
    rentHigh,
    advanceLow,
    advanceHigh,
    commissionLow,
    commissionHigh,
    viewingFee,
    movingFee,
    totalLow,
    totalHigh,
    lines,
  };
}

export type AdvanceFlagLevel = "none" | "review" | "above-six-months";

export interface AdvanceFlag {
  level: AdvanceFlagLevel;
  months: number;
  heading: string;
  message: string;
  rightsUrl: string;
}

/**
 * Flag an advance period against the statutory text cited on the Rights page.
 *
 * The cited provision (Rent Act, 1963 (Act 220) s.25(5), as amended by the Rent
 * Control Act, 1986 (PNDCL 138) s.19(2)) addresses demanding advance rent above
 * one month for a monthly or shorter tenancy, and above six months for a tenancy
 * exceeding six months. This flag only points to that sourced page — it does not
 * decide whether the law covers a particular tenancy.
 */
export function advanceFlag(months: number): AdvanceFlag {
  const m = Math.round(clampNumber(safe(months, 1), ADVANCE_MONTHS_MIN, ADVANCE_MONTHS_MAX * 10, 1));
  const base = {
    months: m,
    rightsUrl: RIGHTS_ADVANCE_URL,
  };
  if (m <= 1) {
    return { ...base, level: "none", heading: "", message: "" };
  }
  if (m > 6) {
    return {
      ...base,
      level: "above-six-months",
      heading: `${m} months of advance is above the six-month threshold in the cited text`,
      message:
        "For a tenancy longer than six months, the statutory text cited on our Rights page addresses demanding advance rent above six months. Whether it applies to this tenancy depends on the facts. This calculator does not approve or refuse any demand — get the demand in writing and read the sourced page before paying.",
    };
  }
  return {
    ...base,
    level: "review",
    heading: `${m} months of advance is worth checking against the cited text`,
    message:
      "For a monthly or shorter tenancy, the statutory text cited on our Rights page addresses demanding advance rent above one month. Many landlords and agents ask for more, but that is a market practice, not proof that the demand is lawful. Read the sourced page and keep every demand in writing.",
  };
}
