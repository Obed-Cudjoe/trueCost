"use client"; // R12 — hero search. Pushes to /search?q=… (server-built Fuse index there).
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <form
      role="search"
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}
      className={`flex w-full gap-2 ${large ? "max-w-xl" : "max-w-md"}`}
    >
      <label htmlFor="site-search" className="sr-only">Search areas and guides</label>
      <input
        id="site-search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder='Try "Spintex", "Kasoa", "advance"…'
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-ink placeholder:text-slate-400 focus:border-gold-deep focus:outline-none"
      />
      <button type="submit" className="btn-primary rounded-lg bg-gold px-5 py-3 font-bold text-ink" aria-label="Search">
        ⌕
      </button>
    </form>
  );
}
