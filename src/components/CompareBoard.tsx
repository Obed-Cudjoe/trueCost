"use client"; // /compare — up to three areas or room types, shareable through the URL.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatGhs } from "@/lib/benchmarks";
import { MAX_COMPARE, buildAreaComparison, buildRoomTypeComparison, parseTypes, sharedRoomTypes, type CompareArea, type CompareInitial } from "@/lib/compare";

type Mode = CompareInitial["mode"];


const NOT_RECORDED = "Not recorded";

function cellTone(recorded: boolean): string {
  return recorded ? "text-ink" : "text-slate-400";
}

export default function CompareBoard({ areas, initial }: { areas: CompareArea[]; initial: CompareInitial }) {
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [slugs, setSlugs] = useState<string[]>(initial.slugs);
  const [scope, setScope] = useState(initial.scope);
  const [areaSlug, setAreaSlug] = useState(initial.areaSlug || areas[0]?.slug || "");
  const [types, setTypes] = useState<string[]>(initial.types);
  const [copied, setCopied] = useState(false);

  const allowedSlugs = useMemo(() => areas.map((area) => area.slug), [areas]);
  const selected = useMemo(() => slugs.map((slug) => areas.find((area) => area.slug === slug)).filter((a): a is CompareArea => Boolean(a)), [slugs, areas]);
  const roomArea = areas.find((area) => area.slug === areaSlug) ?? areas[0] ?? null;
  const roomOptions = useMemo(() => (roomArea ? roomArea.prices.map((price) => price.type) : []), [roomArea]);
  const sharedTypes = useMemo(() => sharedRoomTypes(selected), [selected]);

  const areaComparison = useMemo(() => buildAreaComparison(selected, scope), [selected, scope]);
  const roomComparison = useMemo(() => buildRoomTypeComparison(roomArea, parseTypes(types, roomOptions)), [roomArea, types, roomOptions]);

  // Keep the address bar shareable without triggering a server round trip.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (mode === "areas") {
      for (const slug of slugs) params.append("a", slug);
      if (scope) params.set("type", scope);
    } else {
      if (areaSlug) params.set("area", areaSlug);
      for (const type of types) params.append("t", type);
    }
    const url = `/compare?${params.toString()}`;
    if (typeof window !== "undefined" && window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [mode, slugs, scope, areaSlug, types]);

  function toggleSlug(slug: string) {
    setSlugs((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, slug];
    });
  }

  function toggleType(type: string) {
    setTypes((current) => {
      if (current.includes(type)) return current.filter((item) => item !== type);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, type];
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const primaryChip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-ink bg-ink text-white" : "border-slate-300 bg-white hover:border-gold-deep"}`;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Comparison mode">
        <button type="button" onClick={() => setMode("areas")} aria-pressed={mode === "areas"} className={primaryChip(mode === "areas")}>
          Compare areas
        </button>
        <button type="button" onClick={() => setMode("rooms")} aria-pressed={mode === "rooms"} className={primaryChip(mode === "rooms")}>
          Compare room types
        </button>
        <button type="button" onClick={copyLink} className="ml-auto rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
          {copied ? "✓ Link copied" : "🔗 Copy share link"}
        </button>
      </div>

      {mode === "areas" ? (
        <section className="mt-6" aria-label="Choose areas">
          <h2 className="font-display text-xl text-ink">
            Pick up to {MAX_COMPARE} areas <span className="text-base font-normal text-slate-500">({slugs.length} selected)</span>
          </h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 swipe-row">
            {areas.map((area) => {
              const active = slugs.includes(area.slug);
              const full = !active && slugs.length >= MAX_COMPARE;
              return (
                <button
                  key={area.slug}
                  type="button"
                  onClick={() => toggleSlug(area.slug)}
                  aria-pressed={active}
                  disabled={full}
                  title={full ? `Remove one first — the comparison holds ${MAX_COMPARE} areas` : undefined}
                  className={primaryChip(active) + (full ? " opacity-40" : "")}
                >
                  {area.name}
                </button>
              );
            })}
          </div>

          <div className="mt-4 max-w-sm">
            <label htmlFor="compare-scope" className="mb-1 block text-sm font-medium">
              Narrow to one room type
            </label>
            <select
              id="compare-scope"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
            >
              <option value="">All room types recorded</option>
              {sharedTypes.map((type) => (
                <option key={type} value={type}>
                  {type} (recorded in all selected areas)
                </option>
              ))}
            </select>
          </div>
        </section>
      ) : (
        <section className="mt-6" aria-label="Choose area and room types">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="compare-area" className="mb-1 block text-sm font-medium">
                Area
              </label>
              <select
                id="compare-area"
                value={areaSlug}
                onChange={(event) => {
                  setAreaSlug(event.target.value);
                  setTypes([]);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
              >
                {areas.map((area) => (
                  <option key={area.slug} value={area.slug}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium">
                Room types <span className="font-normal text-slate-500">({types.length} of {MAX_COMPARE})</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {roomOptions.map((type) => (
                  <button key={type} type="button" onClick={() => toggleType(type)} aria-pressed={types.includes(type)} className={primaryChip(types.includes(type))}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {mode === "areas" && (
        <>
          {selected.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-ink">Choose at least one area</h2>
              <p className="mt-1 text-sm text-slate-600">Nothing is compared until you pick an area, so no figures are shown as if they were equivalent.</p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">Recorded monthly ranges by area and room type</caption>
                <thead>
                  <tr className="bg-ink text-gold">
                    <th scope="col" className="sticky left-0 bg-ink px-4 py-3">Room type</th>
                    {selected.map((area) => (
                      <th key={area.slug} scope="col" className="px-4 py-3">
                        <Link href={`/areas/${area.slug}`} className="underline">
                          {area.name}
                        </Link>
                        <span className="block text-[11px] font-normal text-slate-300">Checked {area.lastVerified || "date not recorded"}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {areaComparison.rows.map((row) => (
                    <tr key={row.family} className="border-t border-slate-100 align-top">
                      <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-medium text-ink">
                        {row.group}
                        {row.multiple && <span className="mt-1 block text-[11px] font-normal text-slate-500">Several options recorded; the first is shown.</span>}
                      </th>
                      {row.cells.map((cell, index) => (
                        <td key={`${row.family}-${selected[index]?.slug ?? index}`} className={`px-4 py-3 ${cellTone(cell.recorded)}`}>
                          {cell.recorded ? (
                            <>
                              <span className="block font-semibold">
                                {formatGhs(cell.min)} – {formatGhs(cell.max)}
                              </span>
                              {row.mismatched && cell.label && <span className="mt-0.5 block text-[11px] text-slate-500">as “{cell.label}”</span>}
                            </>
                          ) : (
                            <span className="block font-medium">{NOT_RECORDED}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-medium text-ink">Advance expectation</th>
                    {selected.map((area) => (
                      <td key={`advance-${area.slug}`} className="px-4 py-3 text-slate-600">
                        {area.prices[0]?.advance || NOT_RECORDED}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-medium text-ink">Transport note</th>
                    {selected.map((area) => (
                      <td key={`transport-${area.slug}`} className="px-4 py-3 text-slate-600">
                        {area.realities.find((item) => item.icon === "transport")?.text || NOT_RECORDED}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-medium text-ink">Water note</th>
                    {selected.map((area) => (
                      <td key={`water-${area.slug}`} className="px-4 py-3 text-slate-600">
                        {area.realities.find((item) => item.icon === "water")?.text || NOT_RECORDED}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-medium text-ink">Power note</th>
                    {selected.map((area) => (
                      <td key={`power-${area.slug}`} className="px-4 py-3 text-slate-600">
                        {area.realities.find((item) => item.icon === "power")?.text || NOT_RECORDED}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-medium text-ink">Benchmark last checked</th>
                    {selected.map((area) => (
                      <td key={`checked-${area.slug}`} className="px-4 py-3 text-slate-600">
                        {area.lastVerified || NOT_RECORDED}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {areaComparison.rows.some((row) => row.mismatched) && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              ⚠️ Some areas use different wording for the same broad room type. The rows are lined up by type, not merged: the exact label each area
              uses is shown under the figure. A “2-bedroom house” and a “2-bedroom (gated)” are not the same unit, so compare the notes and the
              address before treating them as equivalent.
            </p>
          )}
          {areaComparison.notSharedEverywhere.length > 0 && !scope && (
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Not every selected area records every room type. Types missing from at least one area:{" "}
              <b>{areaComparison.notSharedEverywhere.join(", ")}</b>. Empty cells mean “not recorded”, never “zero” or “cheap”.
            </p>
          )}
          {selected.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.map((area) => (
                <Link key={`calc-${area.slug}`} href={`/calculator?area=${area.slug}`} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold">
                  🧮 Plan move-in costs in {area.name}
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "rooms" && (
        <>
          {roomComparison.types.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-ink">Choose up to {MAX_COMPARE} room types</h2>
              <p className="mt-1 text-sm text-slate-600">
                Room types are only comparable inside the same area here, because the same label can mean different things in different
                neighbourhoods.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">Room type comparison inside one area</caption>
                <thead>
                  <tr className="bg-ink text-gold">
                    <th scope="col" className="sticky left-0 bg-ink px-4 py-3">Field</th>
                    {roomComparison.types.map((type) => (
                      <th key={type} scope="col" className="px-4 py-3">
                        {type}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roomComparison.rows.map((row) => (
                    <tr key={row.label} className="border-t border-slate-100 align-top">
                      <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-medium text-ink">
                        {row.label}
                      </th>
                      {row.values.map((value, index) => (
                        <td key={`${row.label}-${index}`} className={`px-4 py-3 ${value === NOT_RECORDED ? "text-slate-400" : "text-slate-700"}`}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {roomComparison.missing.length > 0 && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              Not recorded for this area: <b>{roomComparison.missing.join(", ")}</b>. TrueCost does not fill gaps with estimates.
            </p>
          )}
          {roomArea && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/areas/${roomArea.slug}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
                Read the {roomArea.name} guide
              </Link>
              <Link href={`/calculator?area=${roomArea.slug}`} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold">
                🧮 Plan move-in costs in {roomArea.name}
              </Link>
            </div>
          )}
        </>
      )}

      <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-slate-700" role="note">
        Every figure above is a monthly GH₵ range recorded in TrueCost&apos;s editorial dataset, not a quote or a survey result. The dataset does
        not currently record a checked source, sample size, or asking-price-versus-paid-rent split for these areas, so no area is ranked as
        “best” and no row should be read as a verified market price.
      </p>
    </div>
  );
}
