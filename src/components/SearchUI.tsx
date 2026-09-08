"use client"; // P13 — instant Fuse.js search over the server-built index. Zero backend needed.
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import type { SearchEntry } from "@/lib/content";

export default function SearchUI({ index, initial }: { index: SearchEntry[]; initial: string }) {
  const [q, setQ] = useState(initial);
  const fuse = useMemo(() => new Fuse(index, { keys: ["title", "excerpt"], threshold: 0.35 }), [index]);
  const results = q.trim() ? fuse.search(q.trim()).slice(0, 12).map((r) => r.item) : [];

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} autoFocus
          placeholder="Areas, guides, news, rights…"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 focus:border-gold-deep focus:outline-none" />
      </form>
      {q.trim() === "" ? (
        <p className="mt-6 text-slate-600">Popular: {["Spintex", "Kasoa", "Madina", "advance"].map((t) => (
          <button key={t} onClick={() => setQ(t)} className="mr-2 mt-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm hover:border-gold-deep">{t}</button>
        ))}</p>
      ) : results.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-ink">No matches for “{q}”</h2>
          <p className="mt-1 text-sm text-slate-600">Try an area name — or <Link href="/contact" className="font-semibold text-gold-deep underline">request it</Link> and we'll verify it next.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {results.map((r) => (
            <li key={r.url}>
              <Link href={r.url} className="card-hover block rounded-xl border border-slate-200 bg-white p-4">
                <span className="mb-1 inline-block rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-gold-deep">{r.kind}</span>
                <h2 className="font-semibold text-ink">{r.title}</h2>
                <p className="line-clamp-1 text-sm text-slate-600">{r.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
