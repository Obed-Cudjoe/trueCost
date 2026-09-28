// Search results (server builds the index → client combobox + filters).
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchUI from "@/components/SearchUI";
import { getAreas } from "@/lib/content";
import { getBudgetBands, getDiscoveryIndex, getPublishedRoomTypes } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Search",
  description: "Search published TrueCost area guides, room-type guides, and tenant-rights pages.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const areas = getAreas().map((area) => ({ slug: area.slug, name: area.name }));
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="font-display mb-4 text-4xl text-ink">Search TrueCost</h1>
      <p className="mb-5 max-w-2xl text-slate-600">
        Suggestions come only from pages TrueCost has already published — area guides, room-type guides, tenant-rights pages and news.
      </p>
      <SearchUI
        entries={getDiscoveryIndex()}
        roomTypes={getPublishedRoomTypes()}
        budgetBands={getBudgetBands()}
        areas={areas}
        initial={(q ?? "").slice(0, 120)}
      />
    </>
  );
}
