"use client"; // Move-in planning estimate with editable assumptions and visible provenance.
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatGhs } from "@/lib/benchmarks";
import {
  ADVANCE_MONTHS_MAX,
  ADVANCE_MONTHS_MIN,
  COMMISSION_MAX_PERCENT,
  FEE_MAX,
  RENT_MAX,
  RIGHTS_ADVANCE_URL,
  advanceFlag,
  computeMoveInCost,
  type LineSource,
} from "@/lib/calc";
import { FEE_DEFAULTS } from "@/lib/site";

export interface CalcArea {
  slug: string;
  name: string;
  prices: { type: string; min: number; max: number; advance: string }[];
}

const SOURCE_LABEL: Record<LineSource, string> = {
  benchmark: "Site estimate",
  you: "Your entry",
  assumption: "Editable assumption",
};

const SOURCE_CLASS: Record<LineSource, string> = {
  benchmark: "bg-blue-50 text-blue-900 border-blue-200",
  you: "bg-green-50 text-green-900 border-green-200",
  assumption: "bg-slate-100 text-slate-700 border-slate-300",
};

function toNumber(value: string, fallback: number, min: number, max: number): { value: number; invalid: boolean } {
  const trimmed = value.replace(/[,\s₵]/g, "").replace(/^gh/i, "");
  if (trimmed === "") return { value: fallback, invalid: false };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return { value: fallback, invalid: true };
  return { value: parsed, invalid: false };
}

export default function CalculatorWidget({ areas, initialArea = "" }: { areas: CalcArea[]; initialArea?: string }) {
  const valid = areas.some((area) => area.slug === initialArea) ? initialArea : "";
  const [areaSlug, setAreaSlug] = useState(valid || areas[0]?.slug || "");
  const [typeIdx, setTypeIdx] = useState(0);
  const [months, setMonths] = useState(12);
  const [rentInput, setRentInput] = useState("");
  const [rentEdited, setRentEdited] = useState(false);
  const [commissionText, setCommissionText] = useState(String(Math.round(FEE_DEFAULTS.commissionRate * 100)));
  const [viewingText, setViewingText] = useState(String(FEE_DEFAULTS.viewingFee));
  const [movingText, setMovingText] = useState(String(FEE_DEFAULTS.movingFee));

  const area = areas.find((item) => item.slug === areaSlug) ?? areas[0];
  const row = area.prices[Math.min(typeIdx, area.prices.length - 1)];
  const benchmarkMid = Math.round((row.min + row.max) / 2);
  const shownRent = rentEdited ? rentInput : String(benchmarkMid);

  const rent = toNumber(rentInput, benchmarkMid, 0, RENT_MAX);
  const commission = toNumber(commissionText, FEE_DEFAULTS.commissionRate * 100, 0, COMMISSION_MAX_PERCENT);
  const viewing = toNumber(viewingText, FEE_DEFAULTS.viewingFee, 0, FEE_MAX);
  const moving = toNumber(movingText, FEE_DEFAULTS.movingFee, 0, FEE_MAX);

  const math = useMemo(
    () =>
      computeMoveInCost({
        rentLow: row.min,
        rentHigh: row.max,
        rentOverride: rentEdited ? rent.value : null,
        months,
        commissionRate: commission.value / 100,
        viewingFee: viewing.value,
        movingFee: moving.value,
      }),
    [row.min, row.max, rentEdited, rent.value, months, commission.value, viewing.value, moving.value],
  );

  const flag = advanceFlag(months);
  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-ink placeholder:text-slate-400 focus:border-gold-deep focus:outline-none";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <label className="mb-1 block text-sm font-medium" htmlFor="calc-area">
          Area
        </label>
        <select
          id="calc-area"
          value={areaSlug}
          onChange={(event) => {
            setAreaSlug(event.target.value);
            setTypeIdx(0);
            setRentEdited(false);
            setRentInput("");
          }}
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2.5"
        >
          {areas.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>

        <span className="mb-1 block text-sm font-medium">Room type</span>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Room type">
          {area.prices.map((price, index) => (
            <button
              key={price.type}
              type="button"
              onClick={() => {
                setTypeIdx(index);
                setRentEdited(false);
                setRentInput("");
              }}
              aria-pressed={index === typeIdx}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${index === typeIdx ? "border-ink bg-ink text-white" : "border-slate-300 bg-white hover:border-gold-deep"}`}
            >
              {price.type}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="calc-rent">
              Monthly rent (GH₵)
            </label>
            <input
              id="calc-rent"
              inputMode="decimal"
              value={shownRent}
              onChange={(event) => {
                setRentInput(event.target.value);
                setRentEdited(true);
              }}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              {rentEdited ? (
                <>Your entry. The recorded range for this room type is {formatGhs(row.min)} – {formatGhs(row.max)}.</>
              ) : (
                <>Site estimate: the midpoint of the recorded {formatGhs(row.min)} – {formatGhs(row.max)} range. Edit it to use your own figure.</>
              )}
            </p>
            {rentEdited && (
              <button type="button" onClick={() => { setRentEdited(false); setRentInput(""); }} className="mt-1 text-xs font-semibold text-gold-deep underline">
                Use the site estimate instead
              </button>
            )}
            {rent.invalid && <p className="mt-1 text-xs text-red-600">Enter a rent between GH₵0 and {formatGhs(RENT_MAX)}.</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="calc-months">
              Advance months: <b>{months}</b>
            </label>
            <input
              id="calc-months"
              type="range"
              min={ADVANCE_MONTHS_MIN}
              max={ADVANCE_MONTHS_MAX}
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
              className="w-full accent-amber-600"
            />
            <p className="mt-1 text-xs text-slate-500">Your entry — how many months of advance you are being asked to pay.</p>
          </div>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-gold-deep">Editable planning assumptions</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="calc-commission">
              Agent fee (%)
            </label>
            <input id="calc-commission" inputMode="decimal" value={commissionText} onChange={(event) => setCommissionText(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="calc-viewing">
              Viewing fees (GH₵)
            </label>
            <input id="calc-viewing" inputMode="decimal" value={viewingText} onChange={(event) => setViewingText(event.target.value)} className={inputClass} />
            {viewing.invalid && <p className="mt-1 text-xs text-red-600">Enter 0 – {formatGhs(FEE_MAX)}.</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="calc-moving">
              Moving costs (GH₵)
            </label>
            <input id="calc-moving" inputMode="decimal" value={movingText} onChange={(event) => setMovingText(event.target.value)} className={inputClass} />
            {moving.invalid && <p className="mt-1 text-xs text-red-600">Enter 0 – {formatGhs(FEE_MAX)}.</p>}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          These three figures are editable planning assumptions, not quoted market facts. TrueCost does not record a source-backed standard
          commission or viewing fee, so confirm every fee in writing before paying.
        </p>
      </div>

      <div className="rounded-2xl bg-ink p-6 text-white">
        <p className="text-sm uppercase tracking-widest text-gold">Planning estimate</p>
        <p className="font-display my-2 text-4xl md:text-5xl">
          {math.singleFigure ? formatGhs(math.totalLow) : `${formatGhs(math.totalLow)} – ${formatGhs(math.totalHigh)}`}
        </p>
        <p className="text-sm text-slate-300">
          {math.singleFigure
            ? "Based on the rent you entered plus the assumptions above."
            : `Low-to-high band built from the recorded ${formatGhs(row.min)} – ${formatGhs(row.max)} range. It is not a quote.`}
        </p>

        <table className="mt-4 w-full text-left text-sm">
          <caption className="sr-only">Line-by-line move-in cost</caption>
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400">
              <th scope="col" className="py-2">Line</th>
              <th scope="col" className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {math.lines.map((line) => (
              <tr key={line.key} className="border-t border-white/10">
                <td className="py-2 pr-3">
                  <span className="block font-medium text-white">{line.label}</span>
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${SOURCE_CLASS[line.source]}`}>
                    {SOURCE_LABEL[line.source]}
                  </span>
                </td>
                <td className="py-2 text-right font-semibold text-white">
                  {line.low === line.high ? formatGhs(line.low) : `${formatGhs(line.low)} – ${formatGhs(line.high)}`}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gold">
              <td className="py-3 font-bold text-gold">Estimated total to plan for</td>
              <td className="py-3 text-right font-bold text-gold">
                {math.singleFigure ? formatGhs(math.totalLow) : `${formatGhs(math.totalLow)} – ${formatGhs(math.totalHigh)}`}
              </td>
            </tr>
          </tbody>
        </table>

        {flag.level !== "none" && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950" role="note">
            <p className="text-sm font-bold">⚖️ {flag.heading}</p>
            <p className="mt-1 text-sm">{flag.message}</p>
            <Link href={flag.rightsUrl} className="mt-2 inline-block text-sm font-bold underline">
              Read the sourced Rights page →
            </Link>
            <p className="mt-2 text-xs">
              General information, not legal advice. Market practice and the law are not the same thing, and this calculator cannot approve or
              refuse any demand.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <Link href={`/areas/${area.slug}`} className="rounded-lg bg-white px-4 py-2.5 text-center font-semibold text-ink hover:bg-slate-100">
            Read the {area.name} area guide →
          </Link>
          <Link href={`/compare?mode=areas&a=${area.slug}`} className="rounded-lg border border-white/30 px-4 py-2.5 text-center font-semibold text-white">
            Compare {area.name} with another area →
          </Link>
          <Link href={`/get-help?area=${area.slug}`} className="rounded-lg bg-gold px-4 py-2.5 text-center font-bold text-ink">
            Optional: ask for help →
          </Link>
          <p className="text-xs text-slate-300">
            Optional and separate from the newsletter: your details are stored privately for owner review. No property, partner, fee outcome,
            or response time is guaranteed.
          </p>
          <Link href="/rights" className="rounded-lg border border-white/30 px-4 py-2.5 text-center text-sm font-semibold text-white">
            Tenant rights information →
          </Link>
        </div>
      </div>
    </div>
  );
}
