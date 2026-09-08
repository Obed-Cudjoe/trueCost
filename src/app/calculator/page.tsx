// P5 — Move-in cost calculator page ★ decision engine.
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CalculatorWidget from "@/components/CalculatorWidget";
import { getAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "True Move-In Cost Calculator",
  description: "Add the advance, the 10% agent cut, and hidden fees — see what moving in really costs in any Accra area.",
};

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Calculator" }]} />
      <div className="dot-grid rounded-3xl bg-ink px-6 py-10 md:px-10">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold">Advance + agent cut + hidden fees</p>
        <h1 className="font-display mt-1 text-4xl text-white md:text-5xl">True move-in cost calculator</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          The monthly rent is never the full story. Thirty seconds, zero signup — computed from verified benchmarks.
        </p>
      </div>
      <div className="mt-6"><CalculatorWidget areas={getAreas()} initialArea={area ?? ""} /></div>
    </>
  );
}
