// P5 — Move-in cost calculator page ★ decision engine.
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CalculatorWidget from "@/components/CalculatorWidget";
import { getAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "True Move-In Cost Calculator",
  description: "Add the advance, the 10% agent cut, and hidden fees — see what moving in really costs in any Accra area.",
};

export default function CalculatorPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Calculator" }]} />
      <h1 className="font-display text-4xl text-ink">True move-in cost calculator</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        The monthly rent is never the full story. Add the advance, the agent's 10%, and the hidden fees — computed from verified benchmarks.
      </p>
      <div className="mt-6"><CalculatorWidget areas={getAreas()} /></div>
    </>
  );
}
