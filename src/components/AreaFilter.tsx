"use client"; // Budget filter chips + grid for /areas.
import { useState } from "react";
import AreaCard from "./AreaCard";
import type { Area } from "@/lib/content";

type Tier = "all" | "budget" | "mid" | "premium";
const TIERS: { id: Tier; label: string }[] = [
  { id: "all", label: "All areas" },
  { id: "budget", label: "Budget" },
  { id: "mid", label: "Mid-range" },
  { id: "premium", label: "Premium" },
];

function tierOf(a: Area): Tier {
  const lo = Math.min(...a.prices.map((p) => p.min));
  const hi = Math.max(...a.prices.map((p) => p.max));
  if (lo < 800) return "budget";
  if (hi > 9000) return "premium";
  return "mid";
}

export default function AreaFilter({ areas }: { areas: Area[] }) {
  const [tier, setTier] = useState<Tier>("all");
  const list = areas.filter((a) => tier === "all" || tierOf(a) === tier);
  return (
    <>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by budget">
        {TIERS.map((t) => (
          <button key={t.id} onClick={() => setTier(t.id)} aria-pressed={tier === t.id}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${tier === t.id ? "border-ink bg-ink text-white" : "border-slate-300 bg-white hover:border-gold-deep"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-500">{list.length} area{list.length === 1 ? "" : "s"}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => <AreaCard key={a.slug} area={a} />)}
      </div>
    </>
  );
}
