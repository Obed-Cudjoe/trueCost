// Discovery index — built server-side from the published Markdown content only.
// Every entry points at a real, published route; nothing here is generated or guessed.
import { getAreas, getGuides, getNews, getRights } from "./content";
import { parseMoneyRange, roomTypeFamily, FAMILY_ORDER } from "./benchmarks";

export type DiscoveryKind = "Area" | "Guide" | "Right" | "News";

export interface DiscoveryEntry {
  id: string;
  kind: DiscoveryKind;
  title: string;
  excerpt: string;
  url: string;
  /** Room types this page actually records (areas: price rows; guides: the guide subject). */
  roomTypes: string[];
  /** Broad families, used to line up unlike-but-related room types. */
  families: string[];
  minPrice: number | null;
  maxPrice: number | null;
  checkedOn: string;
  /** Extra searchable words (area names covered by a guide, etc.). */
  tags: string[];
}

function areaEntries(): DiscoveryEntry[] {
  return getAreas().map((area) => {
    const mins = area.prices.map((price) => price.min);
    const maxs = area.prices.map((price) => price.max);
    return {
      id: `area:${area.slug}`,
      kind: "Area" as const,
      title: area.name,
      excerpt: area.summary,
      url: `/areas/${area.slug}`,
      roomTypes: area.prices.map((price) => price.type),
      families: [...new Set(area.prices.map((price) => roomTypeFamily(price.type)))],
      minPrice: mins.length ? Math.min(...mins) : null,
      maxPrice: maxs.length ? Math.max(...maxs) : null,
      checkedOn: area.checkedOn || area.lastVerified || "",
      tags: [area.tagline, ...area.realities.map((reality) => reality.title)].filter(Boolean),
    };
  });
}

function guideEntries(): DiscoveryEntry[] {
  return getGuides().map((guide) => {
    const ranges = guide.priceByArea.map((row) => parseMoneyRange(row.range)).filter((r): r is { min: number; max: number } => r !== null);
    return {
      id: `guide:${guide.slug}`,
      kind: "Guide" as const,
      title: guide.title,
      excerpt: guide.summary,
      url: `/guides/${guide.slug}`,
      roomTypes: [guide.title],
      families: [roomTypeFamily(guide.title)],
      minPrice: ranges.length ? Math.min(...ranges.map((r) => r.min)) : null,
      maxPrice: ranges.length ? Math.max(...ranges.map((r) => r.max)) : null,
      checkedOn: guide.checkedOn || guide.lastVerified || "",
      tags: guide.priceByArea.map((row) => row.area),
    };
  });
}

function rightsEntries(): DiscoveryEntry[] {
  return getRights().map((article) => ({
    id: `rights:${article.slug}`,
    kind: "Right" as const,
    title: article.title,
    excerpt: article.summary,
    url: `/rights/${article.slug}`,
    roomTypes: [],
    families: [],
    minPrice: null,
    maxPrice: null,
    checkedOn: article.checkedOn || article.updated || "",
    tags: ["rights", "tenant", "legal information"],
  }));
}

function newsEntries(): DiscoveryEntry[] {
  return getNews().map((post) => ({
    id: `news:${post.slug}`,
    kind: "News" as const,
    title: post.title,
    excerpt: post.excerpt,
    url: `/news/${post.slug}`,
    roomTypes: [],
    families: [],
    minPrice: null,
    maxPrice: null,
    checkedOn: post.updated || post.date || "",
    tags: post.tags ?? [],
  }));
}

let cached: DiscoveryEntry[] | null = null;

export function getDiscoveryIndex(): DiscoveryEntry[] {
  if (cached) return cached;
  cached = [...areaEntries(), ...guideEntries(), ...rightsEntries(), ...newsEntries()];
  return cached;
}

/** Every room-type label that appears on a published page, in a stable order. */
export function getPublishedRoomTypes(): string[] {
  const seen: string[] = [];
  for (const area of getAreas()) {
    for (const price of area.prices) if (!seen.includes(price.type)) seen.push(price.type);
  }
  for (const guide of getGuides()) {
    if (!seen.includes(guide.title)) seen.push(guide.title);
  }
  return seen.sort((a, b) => {
    const fa = FAMILY_ORDER.indexOf(roomTypeFamily(a));
    const fb = FAMILY_ORDER.indexOf(roomTypeFamily(b));
    return fa - fb || a.localeCompare(b);
  });
}

export interface BudgetBand {
  id: string;
  label: string;
  min: number;
  max: number;
  count: number;
}

const BAND_DEFINITIONS: { id: string; label: string; min: number; max: number }[] = [
  { id: "up-to-1000", label: "Up to GH₵1,000 / month", min: 0, max: 1000 },
  { id: "1000-2000", label: "GH₵1,000 – 2,000 / month", min: 1000, max: 2000 },
  { id: "2000-4000", label: "GH₵2,000 – 4,000 / month", min: 2000, max: 4000 },
  { id: "4000-plus", label: "GH₵4,000+ / month", min: 4000, max: Number.POSITIVE_INFINITY },
];

/**
 * Budget bands with real counts, so the UI only offers a band when at least one
 * published record falls inside it. A band matches when the recorded range
 * overlaps it — never by rounding a single figure up or down.
 */
export function getBudgetBands(): BudgetBand[] {
  const entries = getDiscoveryIndex().filter((entry) => entry.minPrice !== null && entry.maxPrice !== null);
  return BAND_DEFINITIONS.map((band) => ({
    ...band,
    count: entries.filter((entry) => (entry.minPrice as number) <= band.max && (entry.maxPrice as number) >= band.min).length,
  })).filter((band) => band.count > 0);
}

export function bandMatches(band: BudgetBand, entry: DiscoveryEntry): boolean {
  if (entry.minPrice === null || entry.maxPrice === null) return false;
  return entry.minPrice <= band.max && entry.maxPrice >= band.min;
}
