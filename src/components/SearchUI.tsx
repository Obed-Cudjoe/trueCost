"use client"; // Instant search over the server-built discovery index (no backend needed).
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatGhs } from "@/lib/benchmarks";
import type { BudgetBand, DiscoveryEntry, DiscoveryKind } from "@/lib/discovery";

const KINDS: { id: DiscoveryKind | "All"; label: string }[] = [
  { id: "All", label: "Everything" },
  { id: "Area", label: "Area guides" },
  { id: "Guide", label: "Room types" },
  { id: "Right", label: "Tenant rights" },
  { id: "News", label: "News" },
];

const POPULAR = ["Spintex", "Madina", "chamber and hall", "advance rent"];

function metaLine(entry: DiscoveryEntry): string {
  const parts: string[] = [];
  if (entry.minPrice !== null && entry.maxPrice !== null) {
    parts.push(`${formatGhs(entry.minPrice)} – ${formatGhs(entry.maxPrice)} per month`);
  }
  if (entry.roomTypes.length > 0) parts.push(entry.roomTypes.join(" · "));
  if (!parts.length && entry.checkedOn) parts.push(`Checked ${entry.checkedOn}`);
  return parts.join(" · ");
}

export interface SearchUIProps {
  entries: DiscoveryEntry[];
  roomTypes: string[];
  budgetBands: BudgetBand[];
  areas: { slug: string; name: string }[];
  initial: string;
}

export default function SearchUI({ entries, roomTypes, budgetBands, areas, initial }: SearchUIProps) {
  const router = useRouter();
  const [q, setQ] = useState(initial.slice(0, 120));
  const [kind, setKind] = useState<DiscoveryKind | "All">("All");
  const [roomType, setRoomType] = useState("");
  const [budget, setBudget] = useState("");
  const [area, setArea] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listboxId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "excerpt", weight: 0.2 },
          { name: "tags", weight: 0.2 },
          { name: "roomTypes", weight: 0.1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [entries],
  );

  const matched = useMemo(() => {
    const text = q.trim();
    if (!text) return entries;
    return fuse.search(text.slice(0, 120)).map((result) => result.item);
  }, [q, fuse, entries]);

  const results = useMemo(() => {
    const band = budgetBands.find((b) => b.id === budget) ?? null;
    return matched.filter((entry) => {
      if (kind !== "All" && entry.kind !== kind) return false;
      if (roomType && !entry.roomTypes.includes(roomType)) return false;
      if (area) {
        const ownsArea = entry.kind === "Area" && entry.title === area;
        const coversArea = entry.tags.some((tag) => tag.toLowerCase() === area.toLowerCase());
        if (!ownsArea && !coversArea) return false;
      }
      if (band) {
        if (entry.minPrice === null || entry.maxPrice === null) return false;
        if (!(entry.minPrice <= band.max && entry.maxPrice >= band.min)) return false;
      }
      return true;
    });
  }, [matched, kind, roomType, budget, area, budgetBands]);

  const suggestions = useMemo(() => results.slice(0, 7), [results]);
  const filtersActive = kind !== "All" || Boolean(roomType) || Boolean(budget) || Boolean(area);

  useEffect(() => setActive(-1), [q, kind, roomType, budget, area]);

  // Close the suggestion list when a tap/click lands outside the combobox.
  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  function go(url: string) {
    setOpen(false);
    router.push(url);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (suggestions.length === 0) return;
      const next = event.key === "ArrowDown" ? (active + 1) % suggestions.length : (active - 1 + suggestions.length) % suggestions.length;
      setActive(next);
      return;
    }
    if (event.key === "Enter") {
      if (open && active >= 0 && suggestions[active]) {
        event.preventDefault();
        go(suggestions[active].url);
      }
      return;
    }
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
      }
    }
  }

  function clearFilters() {
    setKind("All");
    setRoomType("");
    setBudget("");
    setArea("");
  }

  const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-gold-deep focus:outline-none";

  return (
    <div ref={wrapRef}>
      <div className="relative">
        <label htmlFor="site-search-input" className="mb-1 block text-sm font-medium text-ink">
          Search published pages
        </label>
        <input
          id="site-search-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${listboxId}-opt-${active}` : undefined}
          autoComplete="off"
          maxLength={120}
          value={q}
          onChange={(event) => {
            setQ(event.target.value.slice(0, 120));
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Try “Madina”, “chamber and hall”, “advance rent”…"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-ink placeholder:text-slate-400 focus:border-gold-deep focus:outline-none"
        />

        {open && q.trim() !== "" && suggestions.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {suggestions.map((entry, index) => (
              <li
                key={entry.id}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(entry.url);
                }}
                className={`cursor-pointer border-b border-slate-100 px-4 py-3 last:border-b-0 ${index === active ? "bg-cream" : "bg-white"}`}
              >
                <span className="mb-0.5 inline-block rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-gold-deep">{entry.kind}</span>
                <span className="block font-semibold text-ink">{entry.title}</span>
                <span className="block truncate text-xs text-slate-500">{metaLine(entry)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">Filters</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 swipe-row" role="group" aria-label="Filter by page type">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              aria-pressed={kind === k.id}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${kind === k.id ? "border-ink bg-ink text-white" : "border-slate-300 bg-white hover:border-gold-deep"}`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="filter-area" className="mb-1 block text-xs font-medium text-slate-600">
              Area
            </label>
            <select id="filter-area" className={selectClass} value={area} onChange={(event) => setArea(event.target.value)}>
              <option value="">Any area</option>
              {areas.map((item) => (
                <option key={item.slug} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-room" className="mb-1 block text-xs font-medium text-slate-600">
              Room type
            </label>
            <select id="filter-room" className={selectClass} value={roomType} onChange={(event) => setRoomType(event.target.value)}>
              <option value="">Any room type</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-budget" className="mb-1 block text-xs font-medium text-slate-600">
              Monthly budget
            </label>
            <select id="filter-budget" className={selectClass} value={budget} onChange={(event) => setBudget(event.target.value)}>
              <option value="">Any budget</option>
              {budgetBands.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="mt-3 text-sm font-semibold text-gold-deep underline">
            Clear all filters
          </button>
        )}
      </div>

      <p aria-live="polite" className="mt-4 text-sm text-slate-500">
        {results.length} published page{results.length === 1 ? "" : "s"} match{results.length === 1 ? "es" : ""}
        {q.trim() ? ` “${q.trim()}”` : ""}
        {filtersActive ? " with the current filters" : ""}. Results are ordered by text match, not by any ranking of areas.
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-ink">Nothing published matches that yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            TrueCost only shows pages it has actually published. Try a different area name or room type, or clear the filters.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
                Clear filters
              </button>
            )}
            <button type="button" onClick={() => setQ("")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
              Start again
            </button>
            <Link href="/areas" className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold">
              Browse all areas
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            If a price looks wrong, you can{" "}
            <Link href="/report" className="font-semibold text-gold-deep underline">
              send a price observation
            </Link>{" "}
            for review.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {results.map((entry) => (
            <li key={entry.id}>
              <Link href={entry.url} className="card-hover block rounded-xl border border-slate-200 bg-white p-4">
                <span className="mb-1 inline-block rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-gold-deep">{entry.kind}</span>
                <h2 className="font-semibold text-ink">{entry.title}</h2>
                <p className="line-clamp-2 text-sm text-slate-600">{entry.excerpt}</p>
                {metaLine(entry) && <p className="mt-1 text-xs text-slate-500">{metaLine(entry)}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {q.trim() === "" && !filtersActive && (
        <p className="mt-5 text-sm text-slate-600">
          Popular searches:{" "}
          {POPULAR.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQ(term);
                setOpen(false);
              }}
              className="mr-2 mt-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm hover:border-gold-deep"
            >
              {term}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}
