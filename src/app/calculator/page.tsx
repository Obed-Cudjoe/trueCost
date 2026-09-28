// P5 — Move-in cost calculator page ★ decision engine.
import type { Metadata } from "next";
import Link from "next/link";
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
          The monthly rent is never the full story. This is a planning estimate, not a quote: the range, every assumption, and the difference
          between what you entered and what TrueCost estimated are all shown before you use it.
        </p>
      </div>
      <div className="mt-6">
        <CalculatorWidget
          areas={getAreas().map((item) => ({ slug: item.slug, name: item.name, prices: item.prices }))}
          initialArea={area ?? ""}
        />
      </div>
      <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-slate-700" role="note">
        ⚖️ Advance rent has two sides: what landlords commonly ask for, and what the cited statute says may be demanded. This calculator shows
        the market maths and flags the sourced legal text separately. General information, not legal advice — read the{" "}
        <Link href="/rights/six-month-cap" className="font-semibold text-gold-deep underline">
          advance-rent cap page
        </Link>{" "}
        and keep every demand in writing.
      </p>
    </>
  );
}
