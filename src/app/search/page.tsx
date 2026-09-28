// P13 — Search results (server builds index → client Fuse UI).
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchUI from "@/components/SearchUI";
import { getSearchIndex } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search TrueCost areas, guides, news, and tenant rights.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="font-display mb-4 text-4xl text-ink">Search TrueCost</h1>
      <SearchUI index={getSearchIndex()} initial={(q ?? "").slice(0, 120)} />
    </>
  );
}
