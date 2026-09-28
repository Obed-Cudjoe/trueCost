// Comparison logic for /compare — pure functions, unit-tested, no fs access.
import { FAMILY_ORDER, FAMILY_LABEL, formatGhs, roomTypeFamily, type RoomFamily } from "./benchmarks";

export const MAX_COMPARE = 3;

export interface ComparePriceRow {
  type: string;
  min: number;
  max: number;
  advance: string;
}

export interface CompareReality {
  icon: string;
  title: string;
  text: string;
}

export interface CompareArea {
  slug: string;
  name: string;
  tagline: string;
  lastVerified: string;
  prices: ComparePriceRow[];
  realities: CompareReality[];
}

/** Keep only published slugs, drop duplicates, cap at MAX_COMPARE. */
export function parseSlugs(raw: string[] | string | undefined, allowed: string[]): string[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const out: string[] = [];
  for (const value of list) {
    const slug = String(value ?? "").trim();
    if (!slug || out.includes(slug)) continue;
    if (!allowed.includes(slug)) continue; // never invent an area
    out.push(slug);
    if (out.length >= MAX_COMPARE) break;
  }
  return out;
}

/** Keep only published room-type labels, drop duplicates, cap at MAX_COMPARE. */
export function parseTypes(raw: string[] | string | undefined, allowed: string[]): string[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const out: string[] = [];
  for (const value of list) {
    const type = String(value ?? "").trim();
    if (!type || out.includes(type)) continue;
    if (!allowed.includes(type)) continue; // never invent a room type
    out.push(type);
    if (out.length >= MAX_COMPARE) break;
  }
  return out;
}

/** Every room type recorded anywhere in the published areas. */
export function publishedRoomTypes(areas: CompareArea[]): string[] {
  const seen: string[] = [];
  for (const area of areas) {
    for (const row of area.prices) {
      if (!seen.includes(row.type)) seen.push(row.type);
    }
  }
  return seen;
}

/** Room types present in every selected area — the safest basis for a fair comparison. */
export function sharedRoomTypes(selected: CompareArea[]): string[] {
  if (selected.length === 0) return [];
  const counts = new Map<string, number>();
  for (const area of selected) {
    for (const row of area.prices) counts.set(row.type, (counts.get(row.type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count === selected.length)
    .map(([type]) => type);
}

export interface CompareCell {
  recorded: boolean;
  /** The exact label used by this area, so unlike units stay visible. */
  label: string;
  min: number;
  max: number;
  advance: string;
}

export interface CompareRow {
  family: RoomFamily;
  /** Human label for the family. */
  group: string;
  /** Per-area labels, aligned with the selected areas. */
  labels: string[];
  cells: CompareCell[];
  /** True when the areas use different wording for this row. */
  mismatched: boolean;
  /** True when at least one area records more than one option in this family. */
  multiple: boolean;
}

function pickRow(area: CompareArea, family: RoomFamily, wanted?: string): ComparePriceRow | null {
  if (wanted) {
    const exact = area.prices.find((row) => row.type === wanted);
    if (exact) return exact;
  }
  return area.prices.find((row) => roomTypeFamily(row.type) === family) ?? null;
}

export interface AreaComparison {
  rows: CompareRow[];
  /** Room types that are not recorded in every selected area. */
  notSharedEverywhere: string[];
  /** Areas with no usable price rows at all. */
  emptyAreas: string[];
}

/**
 * Build the area-comparison table.
 *
 * Rows are room-type families; columns are the selected areas. A cell is only
 * filled when that area really records a row in that family, so a blank column
 * means "not recorded", never zero.
 */
export function buildAreaComparison(selected: CompareArea[], scope = ""): AreaComparison {
  const rows: CompareRow[] = [];
  const emptyAreas = selected.filter((area) => area.prices.length === 0).map((area) => area.name);

  const families: RoomFamily[] = scope
    ? [roomTypeFamily(scope)]
    : FAMILY_ORDER.filter((family) => selected.some((area) => area.prices.some((row) => roomTypeFamily(row.type) === family)));

  for (const family of families) {
    const cells: CompareCell[] = [];
    const labels: string[] = [];
    let multiple = false;

    for (const area of selected) {
      const inFamily = area.prices.filter((row) => roomTypeFamily(row.type) === family);
      if (inFamily.length > 1) multiple = true;
      const row = pickRow(area, family, scope);
      if (!row) {
        cells.push({ recorded: false, label: "", min: 0, max: 0, advance: "" });
        labels.push("");
      } else {
        cells.push({ recorded: true, label: row.type, min: row.min, max: row.max, advance: row.advance });
        labels.push(row.type);
      }
    }

    if (cells.some((cell) => cell.recorded)) {
      rows.push({
        family,
        group: FAMILY_LABEL[family],
        labels,
        cells,
        mismatched: new Set(labels.filter(Boolean)).size > 1,
        multiple,
      });
    }
  }

  const allTypes = publishedRoomTypes(selected);
  const shared = new Set(sharedRoomTypes(selected));

  return {
    rows,
    notSharedEverywhere: allTypes.filter((type) => !shared.has(type)),
    emptyAreas,
  };
}

export type CompareMode = "areas" | "rooms";

export interface CompareInitial {
  mode: CompareMode;
  slugs: string[];
  scope: string;
  areaSlug: string;
  types: string[];
}

/** Turn raw query parameters into a safe initial state (published values only). */
export function buildInitial(params: Record<string, string | string[] | undefined>, areas: CompareArea[]): CompareInitial {
  const allowed = areas.map((area) => area.slug);
  const mode: CompareMode = params.mode === "rooms" ? "rooms" : "areas";
  const requestedArea = typeof params.area === "string" ? params.area : "";
  const firstArea = areas.find((area) => area.slug === requestedArea) ?? areas[0] ?? null;
  const roomOptions = firstArea ? firstArea.prices.map((price) => price.type) : [];
  return {
    mode,
    slugs: parseSlugs(params.a, allowed),
    scope: typeof params.type === "string" ? params.type : "",
    areaSlug: firstArea?.slug ?? "",
    types: parseTypes(params.t, roomOptions),
  };
}

export interface RoomFieldRow {
  label: string;
  values: string[];
}

export interface RoomTypeComparison {
  area: CompareArea | null;
  types: string[];
  rows: RoomFieldRow[];
  /** Requested types this area does not record. */
  missing: string[];
}

/** Compare room types inside one area. Fields are omitted when not recorded. */
export function buildRoomTypeComparison(area: CompareArea | null, types: string[]): RoomTypeComparison {
  if (!area) return { area: null, types, rows: [], missing: types };

  const chosen = types.map((type) => ({ type, row: area.prices.find((price) => price.type === type) ?? null }));
  const missing = chosen.filter((entry) => !entry.row).map((entry) => entry.type);

  const reality = (icon: string) => area.realities.find((item) => item.icon === icon)?.text ?? "";

  const rows: RoomFieldRow[] = [
    {
      label: "Recorded monthly range",
      values: chosen
        .map((entry) => (entry.row ? { min: entry.row.min, max: entry.row.max } : null))
        .map((v) => (v ? `${formatGhs(v.min)} – ${formatGhs(v.max)}` : "Not recorded")),
    },
    { label: "Advance noted in dataset", values: chosen.map((entry) => entry.row?.advance || "Not source-documented") },
    { label: "Water", values: chosen.map(() => reality("water") || "Not recorded") },
    { label: "Power", values: chosen.map(() => reality("power") || "Not recorded") },
    { label: "Transport", values: chosen.map(() => reality("transport") || "Not recorded") },
    { label: "Benchmark last checked", values: chosen.map(() => area.lastVerified || "Not recorded") },
  ];

  return { area, types, rows, missing };
}
