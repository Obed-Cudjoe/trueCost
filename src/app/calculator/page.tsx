// P5 — Move-in cost calculator page ★ decision engine.
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CalculatorWidget from "@/components/CalculatorWidget";
import { getAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "True Move-In Cost Calculator",
  description: "Use date-stamped Accra rent ranges and clearly labelled planning assumptions to estimate move-in costs.",
  alternates: { canonical: "/calculator" },
};

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Calculator" }]} />
      <div className="dot-grid rounded-3xl bg-ink px-6 py-10 md:px-10">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold">Advance + planning assumptions + other costs</p>
        <h1 className="font-display mt-1 text-4xl text-white md:text-5xl">True move-in cost calculator</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          The monthly rent is never the full story. This is a planning estimate, not a quote: the range and every fee assumption are shown before you use it.
        </p>
      </div>
      <div className="mt-6"><CalculatorWidget areas={getAreas()} initialArea={area ?? ""} /></div>
    </>
  );
}
