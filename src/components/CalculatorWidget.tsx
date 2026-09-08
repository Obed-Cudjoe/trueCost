"use client"; // P5 — signature tool: true move-in cost = advance + 10% commission + fees. 100% client-side.
import { useMemo, useState } from "react";
import Link from "next/link";
import { FEE_DEFAULTS } from "@/lib/site";
import type { Area } from "@/lib/content";

const fmt = (n: number) => "GH₵" + Math.round(n).toLocaleString("en-GH");

export default function CalculatorWidget({ areas, initialArea = "" }: { areas: Area[]; initialArea?: string }) {
  const valid = areas.some((a) => a.slug === initialArea) ? initialArea : "";
  const [areaSlug, setAreaSlug] = useState(valid || areas[0]?.slug || "");
  const [typeIdx, setTypeIdx] = useState(0);
  const [months, setMonths] = useState(12);
  const area = areas.find((a) => a.slug === areaSlug) ?? areas[0];
  const row = area.prices[Math.min(typeIdx, area.prices.length - 1)];

  const math = useMemo(() => {
    const mid = (row.min + row.max) / 2;
    const advance = mid * months;
    const commission = advance * FEE_DEFAULTS.commissionRate;
    const total = advance + commission + FEE_DEFAULTS.viewingFee + FEE_DEFAULTS.movingFee;
    return { mid, advance, commission, total };
  }, [row, months]);

  const shocking = math.total > 30000;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <label className="mb-1 block text-sm font-medium" htmlFor="calc-area">Area</label>
        <select id="calc-area" value={areaSlug} onChange={(e) => { setAreaSlug(e.target.value); setTypeIdx(0); }}
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2.5">
          {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
        <span className="mb-1 block text-sm font-medium">Room type</span>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Room type">
          {area.prices.map((p, i) => (
            <button key={p.type} type="button" onClick={() => setTypeIdx(i)}
              aria-pressed={i === typeIdx}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${i === typeIdx ? "border-ink bg-ink text-white" : "border-slate-300 bg-white hover:border-gold-deep"}`}>
              {p.type}
            </button>
          ))}
        </div>
        <label className="mb-1 block text-sm font-medium" htmlFor="calc-months">
          Advance months: <b>{months}</b>
        </label>
        <input id="calc-months" type="range" min={1} max={36} value={months}
          onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-amber-600" />
        <p className="mt-4 text-xs text-slate-500">
          Assumes 10% commission + ~GH₵{FEE_DEFAULTS.viewingFee} viewing + ~GH₵{FEE_DEFAULTS.movingFee} moving. Mid-range of verified benchmarks.
        </p>
      </div>
      <div className="rounded-2xl bg-ink p-6 text-white">
        <p className="text-sm uppercase tracking-widest text-gold">Your true move-in cost</p>
        <p className="font-display my-2 text-5xl">{fmt(math.total)}</p>
        <ul className="mt-4 space-y-1 text-sm text-slate-300">
          <li>{months} months × {fmt(math.mid)} = <b className="text-white">{fmt(math.advance)}</b></li>
          <li>Agent 10% = <b className="text-white">{fmt(math.commission)}</b></li>
          <li>Viewing + moving ≈ <b className="text-white">{fmt(FEE_DEFAULTS.viewingFee + FEE_DEFAULTS.movingFee)}</b></li>
        </ul>
        <div className="mt-6 flex flex-col gap-2">
          {shocking ? (
            <>
              <p className="text-sm text-slate-300">Ouch? That number is exactly why this site exists.</p>
              <Link href="/rights" className="rounded-lg bg-white px-4 py-2.5 text-center font-semibold text-ink hover:bg-slate-100">Know your rights →</Link>
              <Link href="/get-help" className="rounded-lg bg-gold px-4 py-2.5 text-center font-bold text-ink hover:bg-amber-500">Get matched anyway →</Link>
            </>
          ) : (
            <Link href={`/get-help?area=${area.slug}`} className="btn-primary rounded-lg bg-gold px-4 py-2.5 text-center font-bold text-ink">
              Get matched in {area.name} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
