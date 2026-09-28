// Comparison workspace — up to three areas, or up to three room types in one area.
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CompareBoard from "@/components/CompareBoard";
import { getAreas } from "@/lib/content";
import { buildInitial, type CompareArea } from "@/lib/compare";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  // A parameterised comparison is one of many near-duplicate URLs; keep the bare page indexable.
  const hasSelection = Boolean(params.a ?? params.area ?? params.type ?? params.t ?? params.mode);
  return {
    title: "Compare Accra areas and room types",
    description: "Put up to three Accra areas, or three room types in one area, side by side using only figures TrueCost has recorded.",
    alternates: { canonical: "/compare" },
    ...(hasSelection ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const areas: CompareArea[] = getAreas().map((area) => ({
    slug: area.slug,
    name: area.name,
    tagline: area.tagline,
    lastVerified: area.lastVerified,
    prices: area.prices,
    realities: area.realities,
  }));

  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
      <div className="dot-grid rounded-3xl bg-ink px-6 py-10 md:px-10">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold">Recorded ranges side by side</p>
        <h1 className="font-display mt-1 text-4xl text-white md:text-5xl">Compare areas and room types</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Put up to three areas side by side, or three room types inside one area. Only fields that are actually recorded are shown — a blank
          cell means “not recorded”, never “zero”.
        </p>
      </div>
      <div className="mt-6">
        <CompareBoard areas={areas} initial={buildInitial(params, areas)} />
      </div>
    </>
  );
}
