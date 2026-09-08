// P14 — custom 404 (error state E1): apology + search + popular guides. Never a dead end.
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { getAreas } from "@/lib/content";

export default function NotFound() {
  const popular = getAreas().slice(0, 4);
  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="font-display mt-4 text-4xl text-ink">Hmm — this page packed up and moved.</h1>
      <p className="mt-2 text-slate-600">Try searching, or jump to a popular guide below.</p>
      <div className="mt-6 flex justify-center"><SearchBar /></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {popular.map((a) => (
          <Link key={a.slug} href={`/areas/${a.slug}`} className="card-hover rounded-xl border border-slate-200 bg-white p-4 font-semibold text-ink">
            📍 {a.name} →
          </Link>
        ))}
      </div>
      <Link href="/" className="btn-primary mt-6 inline-block rounded-lg bg-ink px-6 py-3 font-bold text-gold">Back home</Link>
    </div>
  );
}
